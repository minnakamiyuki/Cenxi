  const { requestIdleCallback } = window;
  
  function createElement(
    type: any, 
    props: any, 
    ...children: any[]
    ) {
    return {
      type,
      props: {
        ...props,
        children: children
        .flat()
        .map(child =>
          typeof child === "object"
            ? child
            : createTextElement(child)
        ),
      },
    };
  }
  
  function createTextElement(text: any) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  }
  
  function createDom(fiber: { type: string; props: any; }) {
    const dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);
  
    updateDom(dom, {}, fiber.props);
  
    return dom;
  }
  
  const isEvent = (key: string) => key.startsWith("on");
  const isProperty = (key: string) =>
    key !== "children" && !isEvent(key);
  const isNew = (
    prev: { [x: string]: any; }, 
    next: { [x: string]: any; }
    ) => (key: string | number) =>
    prev[key] !== next[key];
  const isGone = (_prev: any, next: any) => (key: string) => !(key in next);
  function updateDom(
    dom: { 
        [x: string]: any; 
        removeEventListener: (arg0: string, arg1: any) => 
        void; classList: { 
          remove: (arg0: any) => 
          any; add: (arg0: any) => void; 
        }; 
        addEventListener: (arg0: string, arg1: any) => void; 
    }, 
    prevProps: { 
        [x: string]: any; className?: any; 
        }, 
    nextProps: { 
        [x: string]: any; style?: any; className?: any; 
        }) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)
      .filter(
        key =>
          !(key in nextProps) ||
          isNew(prevProps, nextProps)(key)
      )
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2)
        dom.removeEventListener(
          eventType,
          prevProps[name]
        )
      });
  
    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = "";
      });
  
    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        if (name === 'style') { // update style
            transformDomStyle(dom, nextProps.style)
          } else if (name === 'className') { // update className
            prevProps.className && dom.classList.remove(...prevProps.className.split(/\s+/))
            dom.classList.add(...nextProps.className.split(/\s+/))
            } else {
            dom[name] = nextProps[name]
                };
      });
  
    // Add event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2);
        dom.addEventListener(
          eventType,
          nextProps[name]
        )
      });
  }
  
  const reg = /[A-Z]/g;
  function transformDomStyle(
    dom: { style: string; }, 
    style: { [x: string]: any; 
    }) {
        dom.style = Object.keys(style)
            .reduce((acc, styleName) => {
        const key = styleName.replace(
            reg, 
            function(v) { 
              return '-' + v.toLowerCase();
            }
          );
        acc += `${key}: ${style[styleName]};`
        return acc;
      }, '');
  }
  
  function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
  }
  
  function cancelEffects(fiber: { hooks: any[]; }) {
    if (fiber.hooks) {
      fiber.hooks
        .filter(
            (          
              hook: { 
                tag: string; cancel: any; 
            }) => hook.tag === "effect" && hook.cancel
        )
        .forEach((effectHook: { cancel: () => void; }) => {
          effectHook.cancel();
        })
    }
  }
  
  function runEffects(fiber: { hooks: any[]; }) {
    if (fiber.hooks) {
      fiber.hooks
        .filter(
            (          
              hook: { 
                tag: string; effect: any; 
            }) => hook.tag === "effect" && hook.effect
        )
        .forEach((effectHook: { cancel: any; effect: () => any; }) => {
          effectHook.cancel = effectHook.effect();
        });
    };
  }
  
  function commitWork(
    fiber: { 
            parent: any; effectTag: string; 
            dom: any; alternate: { props: any; }; 
            props: any; child: any; sibling: any; 
            }) {
    if (!fiber) {
      return ;
    }
  
    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;
  
    if (fiber.effectTag === "PLACEMENT") {
        if (fiber.dom != null) {
          domParent.appendChild(fiber.dom);
        }
        runEffects(fiber);
      } else if (fiber.effectTag === "UPDATE") {
        cancelEffects(fiber)
        if (fiber.dom != null) {
          updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
          );
        domParent.appendChild(fiber.dom);
        }
        runEffects(fiber);
    } else if (fiber.effectTag === "DELETION") {
      cancelEffects(fiber);
      commitDeletion(fiber, domParent);
      return ;
    }
  
    commitWork(fiber.child);
    commitWork(fiber.sibling);
  }
  
  function commitDeletion(
    fiber: { 
            dom: any; child: any; 
            }, domParent: { 
                            removeChild: (arg0: any) => void; 
                        }) {
    if (fiber.dom) {
      domParent.removeChild(fiber.dom);
    } else {
      commitDeletion(fiber.child, domParent);
    }
  }
  
  function render(element: any, container: any) {
    wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
  }
  
  let nextUnitOfWork = null;
  let currentRoot = null;
  let wipRoot = null;
  let deletions = null;
  
  function workLoop(deadline: { timeRemaining: () => number; }) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(
        nextUnitOfWork
      );
      shouldYield = deadline.timeRemaining() < 1;
    }
  
    if (!nextUnitOfWork && wipRoot) {
      commitRoot();
    }
  
    requestIdleCallback(workLoop);
  }
  
  requestIdleCallback(workLoop);
  
  function performUnitOfWork(fiber: { type: any; child: any; }) {
    const isFunctionComponent =
      fiber.type instanceof Function;
    if (isFunctionComponent) {
      updateFunctionComponent(fiber);
    } else {
      updateHostComponent(fiber);
    }
    if (fiber.child) {
      return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
  }
  
  let wipFiber = null;
  let hookIndex = null;
  
  function updateFunctionComponent(
    fiber: { 
            type: (arg0: any) => any; 
            props: any; 
            }) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
  }
  
  function useState(initial: any) {
    const oldHook =
      wipFiber.alternate &&
      wipFiber.alternate.hooks &&
      wipFiber.alternate.hooks[hookIndex];
    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    };
  
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action: (arg0: any) => any) => {
      hook.state = typeof action === 'function' ? action(hook.state) : action;
    })
  
    const setState = (action: any) => {
      hook.queue.push(action)
      wipRoot = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
      };
      nextUnitOfWork = wipRoot;
      deletions = [];
    }
  
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
  }
  
  const hasDepsChanged = (prevDeps: any[], nextDeps: string | any[]) =>
  !prevDeps ||
  !nextDeps ||
  prevDeps.length !== nextDeps.length ||
  prevDeps.some(
    (dep: any, index: string | number) => dep !== nextDeps[index]
  );

  function useEffect(effect: any, deps: any) {
    const oldHook =
      wipFiber.alternate &&
      wipFiber.alternate.hooks &&
      wipFiber.alternate.hooks[hookIndex];

    const hasChanged = hasDepsChanged(
      oldHook ? oldHook.deps : undefined,
      deps
    );

    const hook = {
      tag: "effect",
      effect: hasChanged ? effect : null,
      cancel: hasChanged && oldHook && oldHook.cancel,
      deps,
    };

    wipFiber.hooks.push(hook);
    hookIndex++;
  }
  
  function updateHostComponent(fiber: { dom: any; props: { children: any; }; }) {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber, fiber.props.children);
  }
  
  function reconcileChildren(
    wipFiber: { 
                alternate: { 
                  child: any; 
                }; 
              child: any; 
            }, elements: string | any[]) 
    {
    let index = 0;
    let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
  
    while (
      index < elements.length ||
      oldFiber != null
    ) {
      const element = elements[index];
      let newFiber = null;
  
      const sameType =
        oldFiber &&
        element &&
        element.type === oldFiber.type;
  
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        };
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        };
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION"
        deletions.push(oldFiber);
      }
  
      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }
  
      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element) {
        prevSibling.sibling = newFiber;
      }
  
      prevSibling = newFiber;
      index++;
    }
  }
  
  const Cenxi = {
    createElement,
    render,
    useState,
    useEffect
  };
  
  export default Cenxi;
  