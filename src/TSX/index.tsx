  import Cenxi from "./Cenxi";

  function Counter() {
    const [state, setState] = Cenxi.useState(1);

  Cenxi.useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <h1
      style={{ marginTop: "100px", textAlign: "center" }}
      className={"foo bar"}
      onClick={() => setState((c: number) => c + 1)}
    >
      Count: {state}
    </h1>
    );
  }
  export default () => {
    const container = document.getElementById("root");
    Cenxi.render(<Counter />, container);
  };