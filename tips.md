# Chrome to Firefox Extension Migration

1. `executeInCurrentTab` function:

   - Chrome:
     ```javascript
     browser.tabs.executeScript({
       target: { tabId: tabs[0].id },
       func: func,
       args: args,
     });
     ```
   - Firefox:
     ```javascript
     browser.tabs.executeScript(tabs[0].id, {
       code: `(${func.toString()})(${JSON.stringify(args)})`,
     });
     ```

2. `checkUrlParams` function:

   - Chrome:
     ```javascript
     browser.tabs.executeScript(
       { target: { tabId: tabs[0].id }, func: () => window.location.href },
       (results) => {
         /* ... */
       }
     );
     ```
   - Firefox:
     ```javascript
     browser.tabs.executeScript(
       tabs[0].id,
       { code: "window.location.href" },
       (results) => {
         /* ... */
       }
     );
     ```

3. Storage:

   - Chrome:
     ```javascript
     localStorage.setItem("key", value);
     let data = localStorage.getItem("key");
     ```
   - Firefox:
     ```javascript
     browser.storage.local.set({ key: value });
     browser.storage.local.get("key", (result) => {
       let data = result.key;
     });
     ```

4. Default item addition:

   - Chrome:
     ```javascript
     if (!localStorage.getItem("defaultItemAdded")) {
       // Add default item
       localStorage.setItem("defaultItemAdded", "true");
     }
     ```
   - Firefox:
     ```javascript
     browser.storage.local.get("defaultItemAdded", (result) => {
       if (!result.defaultItemAdded) {
         // Add default item
         browser.storage.local.set({ defaultItemAdded: true });
       }
     });
     ```

5. Event listeners:

   - No changes required; they work the same in both browsers.

6. URL manipulation functions:
   - No changes required; they run in the web page context.

These changes ensure Firefox compatibility while maintaining functionality.
