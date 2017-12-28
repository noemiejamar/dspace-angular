import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DynamicFormControlEvent, DynamicFormControlModel } from '@ng-dynamic-forms/core';

import { isEqual } from 'lodash';

import { FormBuilderService } from '../../../shared/form/builder/form-builder.service';
import { FormComponent } from '../../../shared/form/form.component';
import { FormService } from '../../../shared/form/form.service';
import {
  DeleteSectionErrorsAction,
  SectionStatusChangeAction,
} from '../../objects/submission-objects.actions';
import { SectionModelComponent } from '../section.model';
import { SubmissionState } from '../../submission.reducers';
import { SubmissionFormsConfigService } from '../../../core/config/submission-forms-config.service';
import {
  isNotEmpty,
  isNotUndefined,
  isUndefined
} from '../../../shared/empty.util';
import { ConfigData } from '../../../core/config/config-data';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { submissionSectionDataFromIdSelector } from '../../selectors';
import { SubmissionFormsModel } from '../../../core/shared/config/config-submission-forms.model';
import { submissionSectionFromIdSelector } from '../../selectors';
import { SubmissionSectionError, SubmissionSectionObject } from '../../objects/submission-objects.reducer';
import parseSectionErrorPaths, { SectionErrorPath } from '../../utils/parseSectionErrorPaths';

import {
  COMBOBOX_METADATA_SUFFIX,
  COMBOBOX_VALUE_SUFFIX,
} from '../../../shared/form/builder/ds-dynamic-form-ui/models/ds-dynamic-combobox.model';
import { FormFieldPreviousValueObject } from '../../../shared/form/builder/models/form-field-previous-value-object';
import { FormAddError } from '../../../shared/form/form.actions';
import { WorkspaceitemSectionDataType } from '../../models/workspaceitem-sections.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'ds-submission-section-form',
  styleUrls: [ './section-form.component.scss' ],
  templateUrl: './section-form.component.html',
})
export class FormSectionComponent extends SectionModelComponent {

  public formId;
  public formModel: DynamicFormControlModel[];
  public isLoading = true;

  protected formConfig: SubmissionFormsModel;
  protected pathCombiner: JsonPatchOperationPathCombiner;
  protected previousValue: FormFieldPreviousValueObject = new FormFieldPreviousValueObject();
  protected subs: Subscription[] = [];

  @ViewChild('formRef') private formRef: FormComponent;

  constructor(protected formBuilderService: FormBuilderService,
              protected formService: FormService,
              protected formConfigService: SubmissionFormsConfigService,
              protected store: Store<SubmissionState>) {
    super();
  }

  ngOnInit() {
    this.pathCombiner = new JsonPatchOperationPathCombiner('sections', this.sectionData.id);
    this.formConfigService.getConfigByHref(this.sectionData.config)
      .flatMap((config: ConfigData) => config.payload)
      .subscribe((config: SubmissionFormsModel) => {
        this.formConfig = config;
        this.formId = this.formService.getUniqueId(this.sectionData.id);
        this.formBuilderService.setAuthorityUuid(this.collectionId);
        this.store.select(submissionSectionDataFromIdSelector(this.submissionId, this.sectionData.id))
          .take(1)
          .subscribe((sectionData: WorkspaceitemSectionDataType) => {
            if (isUndefined(this.formModel)) {
              this.sectionData.errors = [];
              // Is the first loading so init form
              this.initForm(sectionData);
              this.subscriptions();
              this.isLoading = false;
            }
          })
      });
  }

  initForm(sectionData: WorkspaceitemSectionDataType) {
    this.formModel = this.formBuilderService.modelFromConfiguration(this.formConfig, sectionData);
  }

  updateForm(sectionData: WorkspaceitemSectionDataType, errors: SubmissionSectionError[]) {
    this.formModel = this.formBuilderService.modelFromConfiguration(this.formConfig, sectionData);
    this.isLoading = false;
    this.checksForErrors(errors);
  }

  checksForErrors(errors: SubmissionSectionError[]) {
    this.formService.isFormInitialized(this.formId)
      .filter((status: boolean) => status === true)
      .take(1)
      .subscribe(() => {
        errors.forEach((error: SubmissionSectionError) => {
          const errorPaths: SectionErrorPath[] = parseSectionErrorPaths(error.path);

          errorPaths.forEach((path: SectionErrorPath) => {
            if (path.fieldId) {
              const fieldId = path.fieldId.replace(/\./g, '_');

              // Dispatch action to the form state;
              const formAddErrorAction = new FormAddError(this.formId, fieldId, error.message);
              this.store.dispatch(formAddErrorAction);
            }
          });
        });

        // because errors has been shown, remove them from the state
        const removeAction = new DeleteSectionErrorsAction(this.submissionId, this.sectionData.id, errors);
        this.store.dispatch(removeAction);
        this.sectionData.errors = errors;
      });
  }

  subscriptions() {
    this.subs.push(
      /**
       * Subscribe to form status
       */
      this.formService.isValid(this.formId)
      .filter((formValid) => isNotUndefined(formValid))
      .filter((formValid) => formValid !== this.valid)
      .subscribe((formState) => {
        this.valid = formState;
        this.store.dispatch(new SectionStatusChangeAction(this.submissionId, this.sectionData.id, this.valid));
      }),

      /**
       * Subscribe to section state
       */
      this.store.select(submissionSectionFromIdSelector(this.submissionId, this.sectionData.id))
        .filter((sectionState: SubmissionSectionObject) => isNotEmpty(sectionState.data) || isNotEmpty(sectionState.errors))
        .subscribe((sectionState: SubmissionSectionObject) => {
          if (isNotEmpty(sectionState.data) && !isEqual(sectionState.data, this.sectionData.data)) {
            // Data are changed from remote response so update form's values
            // TODO send a notification to notify data may have been changed
            this.sectionData.data = sectionState.data;
            this.isLoading = true;
            setTimeout(() => {
              // Reset the form
              this.updateForm(sectionState.data, sectionState.errors);
            }, 50);
          } else if (isNotEmpty(sectionState.errors)) {
            this.checksForErrors(sectionState.errors);
          }
        })
    )
  }

  onChange(event: DynamicFormControlEvent) {
    this.formBuilderService.dispatchOperationsFromEvent(
      this.pathCombiner,
      event,
      this.previousValue,
      this.hasStoredValue(this.formBuilderService.getId(event.model)));
  }

  onFocus(event: DynamicFormControlEvent) {
    const value = this.formBuilderService.getFieldValueFromChangeEvent(event);
    const path = this.formBuilderService.getPath(event.model);
    if (event.model.id.endsWith(COMBOBOX_METADATA_SUFFIX) || event.model.id.endsWith(COMBOBOX_VALUE_SUFFIX)) {
      this.previousValue.path = path;
      this.previousValue.value = this.formBuilderService.getComboboxMap(event);
    } else if (isNotEmpty(value)) {
      this.previousValue.path = path;
      this.previousValue.value = value;
    }
  }

  onRemove(event: DynamicFormControlEvent) {
    this.formBuilderService.dispatchOperationsFromEvent(
      this.pathCombiner,
      event,
      this.previousValue,
      this.hasStoredValue(this.formBuilderService.getId(event.model)));
  }

  hasStoredValue(fieldId) {
    if (isNotEmpty(this.sectionData.data)) {
      return this.sectionData.data.hasOwnProperty(fieldId);
    } else {
      return false;
    }
  }
}
