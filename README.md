<h1 align="center"> Cenxi.js </h1>

Cenxi.js is a very simple React-like framework whose implementation mainly refers to [build-your-own-react](https://pomb.us/build-your-own-react/).

Unlike Didact.js, Cenxi.js is optimized for some specific JSX scenarios and also updates the view in a more natural way.

Cenxi.js currently only supports JSX compilation to JS (no Typescript support), two of the React Hooks (useState & useEffect) and some of React's basic environments (Fiber).

No support for class components at all, no Virtual DOM complex diff heuristic algorithm...

Cenxi.js allows you to customize Hooks, just add the name of your custom Hooks to 

```javascript
const Cenxi = {
    createElement,
    render,
    useState,
    useEffect,
    /* useyourHooks */
  };
```

to use them.

I am currently trying to rewrite Cenxi.js with Typescript, which means that Cenxi.js will be able to support TSX, so stay tuned!
