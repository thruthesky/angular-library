# Angular Library

Angular Library

## Install

It's not a module. so, you need to install it by `git submodule add`.

If we build it as node module, it would be more easier to use. But we choose it to be as git submodule since it gives a greate convenient to develop and maintain.

```` sh
git submodule add https://github.com/thruthesky/angular-library src/app/modules/angular-library
````

I recommend to use it as a member variable object of global service.

For instance, most apps need a global service which is injected in app module or app component on bootstrapping and will be injected in most of all components.

If you inject it as a member of global service, you don't have to care about the path where you install `angular-library`.

```` typescript
@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [ AngularLibraryService ]
})
````

### Dependencies

* `HttpClientModule`.

## Language

By default, language files are saved into `assets/lang` folder.

`setUserLanguage()` will (1) set user language into localStorage or gets previously selected language from localStorage.
(2) load that language file.
(3) make it selected.

```` typescript
    _.setUserLanguage().subscribe(re => {
      console.log('_.loadUserLanguage(): success: ', re);
    }, e => {
      console.log('_.loadUserLanguage(): failed: ', e);
    });
````

* Note. If app calls `setUserLanguage()` without parameter for the first time in the app, then it may use the browser language.

* After language is loaded, you can use like below.

```` typescript
console.log( _.t('welcome', {name: '재호'}) );
````
