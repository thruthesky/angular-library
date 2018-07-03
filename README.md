# Angular Library

Angular Library

## TODOs

* remove language functionality and make it static.
* publish as node js package.

## Install

It's not a module. so, you need to install it by `git submodule add`.

If we build it as node module, it would be more easier to use. But we choose it to be as git submodule since it gives a greate convenient to develop and maintain.

```` sh
git submodule add https://github.com/thruthesky/angular-library src/app/modules/angular-library
````

* And add `AngularLibraryServiceModule` whereever you want to use.

### Dependencies

* `HttpClientModule`.

## Language

By default, language files are saved into `assets/lang` folder.

To set or load a language from language folder, simple call `setUserLanguage()` method.

`setUserLanguage()` will
(1) If a language code is given, it sets user language code into localStorage
    Or if language code is not given, then it gets previously selected language from localStorage.
    If language code is not given, and user has not chosen a languge code before, then it will use browser language code.
(2) Then, it loads language file of that language code.
(3) Then, it will make the language text as selected. So, it can be used by other language methods.

* Example of setting/loading a language. It should be called in a global app service.

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

### Usability

* If you have a global service like `share`, then you may need to call `t()` like below.

```` typescript
this.share._.t()
````

and if it anoys you, you can make it short like below

```` typescript

class ShareService {
    t(code, info?) {
        return this._.t(code, info)
    }
}

this.share.t(...)
````
