<h1 align="center"> Cenxi.js </h1>

Cenxi.js is a very simple React-like framework whose implementation mainly refers to [build-your-own-react](https://pomb.us/build-your-own-react/).

Unlike Didact.js, Cenxi.js is optimized for some specific JSX scenarios and also updates the view in a more natural way.

![图片](https://user-images.githubusercontent.com/84240546/150669384-a02bfb6f-2bce-41c4-aeb6-0d8f71f9fd02.png)

Cenxi.js currently only supports JSX (and TSX) compilation to JS, two of the React Hooks (useState & useEffect) and some of React's basic environments (Fiber).

No support for class components at all, no Virtual DOM complex diff heuristic algorithm...

Cenxi.js allows you to customize Hooks, just add the name of your custom Hooks to

```typescript
const Cenxi = {
    createElement,
    render,
    useState,
    useEffect,
    /* useYourHooks */
  };
```

to use them.

The TypeScript version of Cenxi.js has completed. Have fun!