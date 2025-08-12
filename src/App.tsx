import React from 'react';
import { SearchTicker } from './SearchTicker';



function App() {
  return (
    <div>
      <div className='justify-center flex text-lg'><h1>Поиск цены криптовалюты</h1></div>
      
      <SearchTicker />
    </div>
  );
}

export default App;