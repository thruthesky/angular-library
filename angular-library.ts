import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const LANGUAGE_CODE = 'language_code';

interface Language {
    code: string;
    folder: string;
    texts: {
        [code: string]: any;
    };
    load: EventEmitter<any>;
    change: EventEmitter<string>;
}

@Injectable()
export class AngularLibraryService {

    static language: Language = {
        code: '',
        folder: 'assets/lang',
        texts: {},
        load: new EventEmitter(),
        change: new EventEmitter()
    };


    constructor(
        public http: HttpClient
    ) { }

    get lang() {
        return AngularLibraryService.language;
    }
    get ln() {
        return this.lang.texts[ this.lang.code ];
    }

abc(v?): Observable<any> {
    if ( v ) {
        return of(v);
    } else {
        return throwError('no value');
    }
}

    /**
     * Returns browser language
     *
     * @param full If it is true, then it returns the full language string like 'en-US'.
     *              Otherwise, it returns the first two letters like 'en'.
     *
     * @returns
     *      - the browser language like 'en', 'en-US', 'ko', 'ko-KR'
     *      - null if it cannot detect a language.
     */
    private getBrowserLanguage(full = false): string {
        const nav = window.navigator;
        const browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'];
        let ln: string = null;
        // support for HTML 5.1 "navigator.languages"
        if (Array.isArray(nav.languages)) {
            for (let i = 0; i < nav.languages.length; i++) {
                const language = nav.languages[i];
                if (language && language.length) {
                    ln = language;
                    break;
                }
            }
        }
        // support for other well known properties in browsers
        for (let i = 0; i < browserLanguagePropertyKeys.length; i++) {
            const language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                ln = language;
                break;
            }
        }
        if (ln) {
            if (full === false) {
                ln = ln.substring(0, 2);
            }
        }
        return ln;
    }




    /**
     * Gets data from localStroage and returns after JSON.parse()
     * .set() automatically JSON.stringify()
     * .get() automatically JSON.parse()
     *
     * @return
     *      null if there is error or there is no value.
     *      Or value that were saved.
     */
    get(key: string): any {
        const value = localStorage.getItem(key);
        if (value !== null) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return null;
            }
        }
        return null;
    }




    /**
     * Saves data to localStorage.
     *
     * It does `JSON.stringify()` before saving, so you don't need to do it by yourself.
     *
     * @param key key
     * @param data data to save in localStorage
     */
    set(key, data): void {
        // console.log("storage::set()", data);
        localStorage.setItem(key, JSON.stringify(data));
    }


    /**
     * Returns language code like 'ko', 'en', 'jp'.
     *
     * It first checks if user has selected his language already (from localStorage).
     * If not, it returns browser language.
     *
     * @return language code.
     */
    getUserLanguage(): string {
        const ln = this.get(LANGUAGE_CODE);
        if (ln && ln.length === 2) {
            return ln;
        } else {
            return this.getBrowserLanguage();
        }
    }


    /**
     * @see README
     */
    setUserLanguage(code?: string) {
        if ( code ) {
            this.set(LANGUAGE_CODE, code);
        } else {
            code = this.getUserLanguage();
        }
        return this.loadLanguage(code);
    }

    getLanguagePath(code: string): string {
        return this.lang.folder + '/' + code + '.json';
    }


    /**
     *
     * loads a language json file.
     *
     *
     *
     */
    loadLanguage(code: string): Observable<any> {
        this.lang.code = code;
        if (this.lang.texts[code]) {
            return of(this.ln);
        }
        const url = this.getLanguagePath(code);
        // console.log(`loadLanguage: url: ${url}`);
        return this.http.get(url).pipe(
            map( re => {
                // console.log('pipe: map: ', re);
                if (re) {
                    const keys = Object.keys(re);
                    if (keys.length) {                /// Make the case of keys uppercase. @see README.
                        for (const k of keys) {
                            const uppercase = k.toLocaleUpperCase();
                            if (k !== uppercase) {
                                re[uppercase] = re[k];
                                delete re[k];
                            }
                        }
                    }
                }
                this.lang.texts[code] = re;
                           /// Sets reference of current language texts. @see README
                // console.log(` =========== >>>>> Language ${ln} has been set.`);
                // return this.ln;
                return this.ln;
            }),
            catchError( e => {
                // console.log('e: ', e);
                return throwError(e);
            })
        );
    }



    /**
     * Returns the texts of the input code.
     *
     * It does not translates. Meaning it does not add `information` to the result text. It simply returns.
     * If the language is not `en`, then it gets the text of the language.
     *
     * @param code code. This is not language code. It's the text code. The code will be transformed to uppercase.
     *
     * @returns text of that code.
     *      - if the code does not exist on text file, then it returns the code itself.
     *
     *      - if `code` is falsy, it returns the whole texts of the language code.
     *
     * @example How to display texts on template
     *          {{ fire.getText() | json }}
     */
    getText(code?: string): string {
        const ln = this.lang.code; // two letters of langage code.
        if (!code) {
            return this.lang.texts[ln];
        }
        code = code.toUpperCase();
        const texts = this.lang.texts; // whole texts including whole language codes.

        /**
         * `text` should hold the text of the language code.
         */
        let text = null; // the selected text string.
        if (this.lang.code !== 'en') { // if not English,
            if (texts[ln] !== void 0 && texts[ln][code] !== void 0) { // check if the text of the language exists
                text = texts[ln][code];
            }
        }

        // console.log('code: ', code, 'text: ', text);
        /**
         * If `text` has not any value, then the language( language file ) has no text for that code.
         * So, it is going to get text from English langauge file by default.
         */
        if (!text) { // if current language is `English` or the text of that language not found,
            if (texts['en'] && texts['en'][code]) { // get the text of the code in English
                text = texts['en'][code];
            }
        }
        if (!text) { // if no text found, return the code.
            text = code;
        }
        return text;
    }

    /**
     * Returns translated text string.
     * @param code code to translate
     * @param info information to add on the translated text
     *
     * @example
     *          {{ fire.translate('HOME') }}
     *          {{ fire.t('HOME') }}
     *          {{ fire.ln.HOME }}
     */
    translate(code: string, info?): string {
        return this.patchMarker(this.getText(code), info);
    }

    /**
     * Alias of translate()
     * @param code same as translate()
     * @param info same as transate()
     */
    t(code: any, info?: any): string {
        // console.log('code', code);
        return this.translate(code, info);
    }


    /**
     *
     * Returns a string after patching error information.
     * @param str Error string
     * @param info Error information to patch into the string
     *
     *
     *
     * @return patched string
     *
     * @code
     *      _.patchmarker( 'Unknown #no', {no: 123} ) // returns 'Unknown 123'
     *
     */
    patchMarker(str, info: object = null): string {

        if (info === null || typeof info !== 'object') {
            return str;
        }
        const keys = Object.keys(info);
        if (!keys.length) {
            return str;
        }

        for (const k of keys) {
            str = str.replace('#' + k, (<string>info[k]));
        }
        return str;
    }



    /**
     * Returns http query string.
     * @param params Object to build as http query string
     * @return
     *      - http query string
     *      - Or null if the input is emtpy or not object.
     */
    httpBuildQuery(params): string | null {

        if (this.isEmpty(params)) {
            return null; //
        }

        const keys = Object.keys(params);
        if (keys.length === 0) {
            return null; //
        }

        const esc = encodeURIComponent;
        const query = keys
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');
        return query;
    }

    /**
     * Returns n'th portion of the input `str` after spliting by the `separator`
     *
     * @param str string to get a portion from.
     * @param separator to split the string. Default is a Blank.
     * @param n n'th portion to get. Index begins with 0. Default is 0.
     * @return
     *      - a portion of the input string.
     *      - or null
     *          - if the input `str` is empty.
     *          - if the input `str` is not a string.
     *          - if the n'th portion does not exists.
     *          - if the value of the portion is empty
     *          - if separator is not a string and empty.
     *
     * @code
     *      const str = 'abc.def.ghi';
     *      return this.library.segment( str, '.', 0 ); // returns `abc`
     *
     */
    segment(str: string, separator: string = ' ', n: number = 0): string {
        if (typeof str !== 'string') {
            return null;
        }
        if (typeof separator !== 'string' || !separator) {
            return null;
        }
        if (str) {
            const re = str.split(separator);
            if (re[n] !== void 0 && re[n]) {
                return re[n];
            }
        }
        return null;
    }


    /**
     * Returns true if the input `what` is falsy or empty or no data.
     * @returns true if the input `what` is
     *          - falsy value.
     *              -- boolean and it's false,
     *              -- number with 0.
     *              -- string with empty. ( if it has any vlaue like blank, then it's not empty. )
     *              -- undefined.
     *          - object with no key.
     *          - array with 0 length.
     *
     *      - otherwise return false.
     */
    isEmpty(what): boolean {
        if (!what) {
            return true; // for number, string, boolean, any falsy.
        }
        if (typeof what === 'object') {
            return Object.keys(what).length === 0;
        }
        if (Array.isArray(what)) {
            return what.length === 0;
        }
        return false;
    }

    /**
     * Returns true if the input `a` and `b` are identical.
     * @param a Object a
     * @param b Object b
     */
    isEqual(a, b): boolean {
        if (typeof a === 'object' && typeof b === 'object') {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            return aKeys.findIndex((v, i) => v !== bKeys[i]) === -1;
        } else if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            } else {
            }
        } else {
            return a === b;
        }
    }

    isString(str) {
        return typeof str === 'string';
    }


    /**
     *
     * Removes properties with `undefined` value from the object and returns it.
     *
     * You cannot set `undefiend` value into firestore `document`. It will produce a Critical error.
     *
     * @param obj Object to be set into `firestore`.
     *      It is passed by reference.
     *
     * @return the input object that has sanitized.
     */
    sanitize(obj): any {
        if (obj) {
            if (typeof obj === 'object') {
                Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
            }
        }

        /** Remove `password`. It should not  be saved on documents. */
        if (obj && obj['password'] !== void 0) {
            delete obj['password'];
        }

        return obj;
    }

    /**
     * Removes space(s) between the separator in `separator`
     * @description
     *      If the input str is given with `a, b, c c ,d `, then the return will be `a,b,c c,d`.
     * @param separator separator in string
     * @param str string to remove space from.
     *
     * @returns a string after removing spaces between the `separator`.
     *      - if the string is falsy, it returns the input `str` itself.
     */
    removeSpaceBetween(separator: string, str: string): string {
        if (!str) {
            return str;
        } else {
            return str.split(separator).map(s => s.trim()).join(separator);
        }
    }



}
