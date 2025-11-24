function App() {
  const env = import.meta.env.PROD;
  return <>ENV:{env ? "本番" : "開発"}</>;
}

export default App;
