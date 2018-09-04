/**
 *
 * Language related method cannot be static since it must inject HTTPClient.
 * So, it was put simply not to use static methods.
 */
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const VERSION = '0.2';
const LANGUAGE_CODE = 'language_code';


export class AngularLibrary {

    constructor(
    ) { }

    static get version() {
        return VERSION;
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
    static getBrowserLanguage(full = false): string {
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
    static get(key: string): any {
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
    static set(key, data): void {
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
    static getUserLanguage(): string {
        const ln = AngularLibrary.get(LANGUAGE_CODE);
        if (ln && ln.length === 2) {
            return ln;
        } else {
            return AngularLibrary.getBrowserLanguage();
        }
    }

    static setUserLanguage(code: string) {
        AngularLibrary.set(LANGUAGE_CODE, code);
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
    static patchMarker(str, info: object = null): string {

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
     *
     * @desc This method is not perfect. It is not developed for complicated query.
     *
     * @param params Object to build as http query string
     * @return
     *      - http query string
     *      - Or null if the input is emtpy or not object.
     */
    static httpBuildQuery(params): string | null {

        if (AngularLibrary.isEmpty(params)) {
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
    static segment(str: string, separator: string = ' ', n: number = 0): string {
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
    static isEmpty(what): boolean {
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
     * Compares Scalars, Arrays, Objects.
     *
     * Returns true if the input `a` and `b` are identical.
     *
     * @param a It can be an array, string, number, objects.
     * @param b It can be an array, string, number, objects.
     */
    static isEqual(a, b): boolean {
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
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) {
                        return false;
                    }
                }
                return true;
            }
        } else {
            return a === b;
        }
    }

    /**
     * Returns true if the input `str` is a string.
     *
     * @param str any value
     */
    static isString(str) {
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
    static sanitize(obj): any {
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
    static removeSpaceBetween(separator: string, str: string): string {
        if (!str) {
            return str;
        } else {
            return str.split(separator).map(s => s.trim()).join(separator);
        }
    }

    /**
     * returns page width
     *
     * $sm: 576px;
        $md: 768px;
        $lg: 992px;
        $xg: 1200px;
     */
    static pageWidth(): number {
        return window.innerWidth;
    }

    static xs(): boolean {
        return AngularLibrary.pageWidth() < 576;
    }
    /**
     * Returns true if page width is bigger than 575px
     */
    static sm(): boolean {
        return AngularLibrary.pageWidth() >= 576;
    }
    /**
     * Returns true if page width is bigger than 767px
     */
    static md(): boolean {
        return AngularLibrary.pageWidth() >= 768;
    }
    /**
     * Returns true if page width is bigger than 991px
     */
    static lg(): boolean {
        return AngularLibrary.pageWidth() >= 992;
    }
    /**
     * Returns true if page width is bigger than 1999px
     */
    static xg(): boolean {
        return AngularLibrary.pageWidth() >= 1200;
    }


    /**
     * Listens for window resize.
     *
     * You will need to detach the event linstener manually or unless it will subscribe muliple times of window resize event
     *  Resulting in listening multiple times of event.
     *
     * @param ms is the mili seconds for debouncing time.
     * @example
            constructor(
                public _: AngularLibraryService
            ) {
                // Window resize handler.
                _.windowResize().subscribe((event: Event) => {
                    // console.log('resize event: ', event);
                });

                // This one is for re-drawing the page after window has been resized.
                _.windowResize(3000).subscribe((event: Event) => {
                    // console.log('resize event handler for redrawing : ', event);
                    this.render();
                });
            }

     * @desc Good place of calling method to observe window resize is in an App Serivce.
     */
    static windowResize(ms = 100) {
        return fromEvent(window, 'resize').pipe(
            debounceTime(ms)
        );
    }

    /**
     * It scrolls the page to the top.
     *
     * Use this method when you need to scroll to the top of the page.
     *
     * @param timeout timeout ms
     * @example
     *      _.scrollToTop();
     *      _.scrollToTop(50);
     */
    static scrollToTop(timeout?) {
        if (timeout) {
            setTimeout(() => {
                window.document.body.scrollTop = window.document.documentElement.scrollTop = 0;
                // console.log('scroll, ', timeout);
            }, timeout);
        } else {
            window.document.body.scrollTop = window.document.documentElement.scrollTop = 0;
        }
    }

    /**
     * Returns true if the platform is Cordova.
     */
    static isCordova(): boolean {
        const win = window as any;
        return !!(win['cordova'] || win['phonegap'] || win['PhoneGap']);
    }

    /**
     * Returns true if the platform is mobile web. not cordova.
     */
    static isMobileWeb(): boolean {
        if (AngularLibrary.isCordova()) {
            return false;
        }
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }

    /**
     * Returns cookie value
     * @param name cookie name
     */
    static getCookie(name: string) {
        const ca: Array<string> = document.cookie.split(';');
        const cookieName = name + '=';
        let c: string;

        for (let i = 0; i < ca.length; i += 1) {
            if (ca[i].indexOf(name, 0) > -1) {
                c = ca[i].substring(cookieName.length + 1, ca[i].length);
                // console.log('valore cookie: ' + c);
                return c;
            }
        }
        return '';
    }


    /**
     * Returns number from string.
     *
     * @param v value of number
     *  number on success
     *  0 if the input cannot be converted into number.
     */
    static parseNumber(v): number {
        if (v) {
            if (isNaN(v)) {
                return 0;
            } else {
                if (typeof v === 'number') {
                    return v;
                } else {
                    return parseInt(v, 10);
                }
            }
        } else {
            return 0;
        }
    }


    static isPushPermissionRequested() {
        // Let's check if the browser supports notifications
        if (!('Notification' in window) || Notification === void 0 || Notification['permission'] === void 0) {
            // console.log('This browser does not support desktop notification');
            return false;
        }
        // console.log(`Notification['permission']`, Notification['permission']);
        return Notification['permission'] !== 'default';
    }
    static isPushPermissionDenied() {
        if (AngularLibrary.isPushPermissionRequested()) {
            return Notification['permission'] === 'denied';
        } else {
            return false;
        }
    }
    static isPushPermissionGranted() {
        if (AngularLibrary.isPushPermissionRequested()) {
            return Notification['permission'] === 'granted';
        } else {
            return false;
        }
    }

    /**
     * returns the last element of array or undefined if there is no value.
     * @param arr array
     */
    static last(arr) {
        if (arr && arr.length) {
            return arr[arr.length - 1];
        }
    }

    /**
     * Returns true if the mime type is for image.
     * @param type Mime type
     */
    static isImageType(type: string): boolean {
        if (type === void 0 || !type || typeof type !== 'string') {
            return false;
        }
        if (type.indexOf('image') !== 0) {
            return false;
        }
        return true;
    }

    static humanFileSize(size: any) {
        // var i = Math.floor(Math.log(size) / Math.log(1024));
        size = AngularLibrary.parseNumber(size);
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (<any>(size / Math.pow(1024, i))).toFixed(2) * 1 + '' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    /**
     * strip out HTML tags.
     * @param str string
     */
    static stripTags(str) {
        return str.replace(/<\/?.+?>/ig, '');
    }

    /**
     * Returns the salt
     * @param len length of random string without the length of salt
     * @param salt salt
     */
    static randomString(len = 15, salt = ''): string {
        const rnd = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        const str = rnd.substring(2, len + 2);
        if (salt) {
            return salt + str;
        } else {
            return str;
        }
    }

}
