import Counter from "./components/Counter"
import MultiSelectComponent from "./components/MultiSelect"


function App() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center gap-10">
        <Counter />
        <MultiSelectComponent />
      </div>
    </div>
  )
}

export default App
