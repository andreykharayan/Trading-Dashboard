import React from 'react';
import { SearchTicker } from './SearchTicker';
import  FallingStars  from './components/FallingStars';


function App() {
  return (
    <div>
      <div className='justify-center flex text-lg'><h1>Поиск цены криптовалюты</h1></div>
      <FallingStars />
      <SearchTicker />
    </div>
  );
}

export default App;