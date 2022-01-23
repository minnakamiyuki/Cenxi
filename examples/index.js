  import Cenxi from "/src/Cenxi";

  /** @jsx Cenxi.createElement */
  function Counter() {
    const [state, setState] = Cenxi.useState(1);
    
    Cenxi.useEffect(() => {
        console.log(state)
    }, [state]);

    return (
      <h1 
       style={{marginTop: '100px', 
       textAlign: 'center'}} 
       className={'foo bar'} 
       onClick={() => setState(c => c + 1)}
      >
        Count: {state}
      </h1>
    );
  }
  const element = <Counter />;
  const container = document.getElementById("root");
  Cenxi.render(element, container);