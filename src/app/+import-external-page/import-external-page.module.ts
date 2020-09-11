import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { ImportExternalRoutingModule } from './import-external-routing.module';
import { SubmissionModule } from '../submission/submission.module';
import { ImportExternalPageComponent } from './import-external-page.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreModule.forRoot(),
    ImportExternalRoutingModule,
    SubmissionModule,
  ],
  declarations: [
    ImportExternalPageComponent
  ],
  entryComponents: [ ]
})

/**
 * This module handles all components that are necessary for the submission external import page
 */
export class ImportExternalPageModule {

}
