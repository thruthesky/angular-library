import { NgModule } from '@angular/core';
import { AngularLibraryService } from './angular-library';
import { HttpClientModule } from '@angular/common/http';
export { AngularLibraryService };


@NgModule({
    imports: [HttpClientModule],
    exports: [],
    declarations: [],
    providers: [AngularLibraryService],
})
export class AngularLibraryServiceModule { }
