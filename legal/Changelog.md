TO BE REVIEWED

4.18.1 / 2022-04-29
===================

  * Fix hanging on large stack of sync routes

4.18.0 / 2022-04-25
===================

  * Add "root" option to `res.download`
  * Allow `options` without `filename` in `res.download`
  * Deprecate string and non-integer arguments to `res.status`
  * Fix behavior of `null`/`undefined` as `maxAge` in `res.cookie`
  * Fix handling very large stacks of sync middleware
  * Ignore `Object.prototype` values in settings through `app.set`/`app.get`
  * Invoke `default` with same arguments as types in `res.format`
  * Support proper 205 responses using `res.send`
  * Use `http-errors` for `res.format` error
  * deps: body-parser@1.20.0
    - Fix error message for json parse whitespace in `strict`
    - Fix internal error when inflated body exceeds limit
    - Prevent loss of async hooks context
    - Prevent hanging when request already read
    - deps: depd@2.0.0
    - deps: http-errors@2.0.0
    - deps: on-finished@2.4.1
    - deps: qs@6.10.3
    - deps: raw-body@2.5.1
  * deps: cookie@0.5.0
    - Add `priority` option
    - Fix `expires` option to reject invalid dates
  * deps: depd@2.0.0
    - Replace internal `eval` usage with `Function` constructor
    - Use instance methods on `process` to check for listeners
  * deps: finalhandler@1.2.0
    - Remove set content headers that break response
    - deps: on-finished@2.4.1
    - deps: statuses@2.0.1
  * deps: on-finished@2.4.1
    - Prevent loss of async hooks context
  * deps: qs@6.10.3
  * deps: send@0.18.0
    - Fix emitted 416 error missing headers property
    - Limit the headers removed for 304 response
    - deps: depd@2.0.0
    - deps: destroy@1.2.0
    - deps: http-errors@2.0.0
    - deps: on-finished@2.4.1
    - deps: statuses@2.0.1
  * deps: serve-static@1.15.0
    - deps: send@0.18.0
  * deps: statuses@2.0.1
    - Remove code 306
    - Rename `425 Unordered Collection` to standard `425 Too Early`