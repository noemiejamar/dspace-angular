import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';

import { SubmissionServiceStub } from '../../../shared/testing/submission-service.stub';
import { mockSubmissionId } from '../../../shared/mocks/submission.mock';
import { SubmissionService } from '../../submission.service';
import { SubmissionFormCollectionComponent } from './submission-form-collection.component';
import { CommunityDataService } from '../../../core/data/community-data.service';
import { SubmissionJsonPatchOperationsService } from '../../../core/submission/submission-json-patch-operations.service';
import { SubmissionJsonPatchOperationsServiceStub } from '../../../shared/testing/submission-json-patch-operations-service.stub';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { createTestComponent } from '../../../shared/testing/utils.test';
import { CollectionDataService } from '../../../core/data/collection-data.service';

describe('SubmissionFormCollectionComponent Component', () => {

  let comp: SubmissionFormCollectionComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<SubmissionFormCollectionComponent>;
  let submissionServiceStub: SubmissionServiceStub;
  let jsonPatchOpServiceStub: SubmissionJsonPatchOperationsServiceStub;

  const submissionId = mockSubmissionId;
  const collectionId = '1234567890-1';
  const definition = 'traditional';

  const communityDataService: any = jasmine.createSpyObj('communityDataService', {
    findAll: jasmine.createSpy('findAll')
  });

  const collectionDataService: any = jasmine.createSpyObj('collectionDataService', {
    findById: jasmine.createSpy('findById'),
    getAuthorizedCollectionByCommunity: jasmine.createSpy('getAuthorizedCollectionByCommunity')
  });

  const store: any = jasmine.createSpyObj('store', {
    dispatch: jasmine.createSpy('dispatch'),
    select: jasmine.createSpy('select')
  });
  const jsonPatchOpBuilder: any = jasmine.createSpyObj('jsonPatchOpBuilder', {
    replace: jasmine.createSpy('replace')
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        SubmissionFormCollectionComponent,
        TestComponent
      ],
      providers: [
        { provide: CollectionDataService, useValue: collectionDataService },
        { provide: SubmissionJsonPatchOperationsService, useClass: SubmissionJsonPatchOperationsServiceStub },
        { provide: SubmissionService, useClass: SubmissionServiceStub },
        { provide: CommunityDataService, useValue: communityDataService },
        { provide: JsonPatchOperationsBuilder, useValue: jsonPatchOpBuilder },
        { provide: Store, useValue: store },
        ChangeDetectorRef,
        SubmissionFormCollectionComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-submission-form-collection [currentCollectionId]="collectionId"
                                       [currentDefinition]="definitionId"
                                       [submissionId]="submissionId"
                                       (collectionChange)="onCollectionChange($event)">
        </ds-submission-form-collection>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create SubmissionFormCollectionComponent', inject([SubmissionFormCollectionComponent], (app: SubmissionFormCollectionComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SubmissionFormCollectionComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
      submissionServiceStub = TestBed.get(SubmissionService);
      jsonPatchOpServiceStub = TestBed.get(SubmissionJsonPatchOperationsService);
      comp.currentCollectionId = collectionId;
      comp.currentDefinition = definition;
      comp.submissionId = submissionId;
    });

    afterEach(() => {
      comp = null;
      compAsAny = null;
      fixture = null;
      submissionServiceStub = null;
      jsonPatchOpServiceStub = null;
    });

    it('should init JsonPatchOperationPathCombiner', () => {
      const expected = new JsonPatchOperationPathCombiner('sections', 'collection');

      fixture.detectChanges();

      expect(compAsAny.pathCombiner).toEqual(expected);
    });

    describe('', () => {
      let dropdowBtn: DebugElement;
      let dropdownMenu: DebugElement;

      beforeEach(() => {
        fixture.detectChanges();
        dropdowBtn = fixture.debugElement.query(By.css('#collectionControlsMenuButton'));
        dropdownMenu = fixture.debugElement.query(By.css('#collectionControlsDropdownMenu'));
      });

      it('should have dropdown menu closed', () => {

        expect(dropdowBtn).not.toBeUndefined();
        expect(dropdownMenu.nativeElement.classList).not.toContain('show');

      });

      it('should display dropdown menu when click on dropdown button', fakeAsync(() => {

        spyOn(comp, 'onClose');
        dropdowBtn.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(comp.onClose).toHaveBeenCalled();
          expect(dropdownMenu.nativeElement.classList).toContain('show');
        });
      }));

    });

  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

  collectionId = '1234567890-1';
  definitionId = 'traditional';
  submissionId = mockSubmissionId;

  onCollectionChange = () => { return; }

}
