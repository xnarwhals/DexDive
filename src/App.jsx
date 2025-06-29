import { useState  } from 'react'
import './App.css'

function App() {

  const [pokemon, setPokemon] = useState(null);

  // each prev pokemon has a name and img in left bar
  const [previousPokemon, setPreviousPokemon] = useState([]);

  // banned attributes are displayed in the right bar
  const [bannedAttributes, setBannedAttributes] = useState([]); 

  const [displayStats, setDisplayStats] = useState([]);

  const banDisplayStat = (pokeStat) => {
    if (!displayStats.includes(pokeStat)) {
      setDisplayStats(prev => [...prev, pokeStat]);
    }
  }

  const unbanDisplayStat = (pokeStat) =>{
    setDisplayStats(prev => prev.filter(el => el != pokeStat))
  }

  const banAttribute = (attribute) => {
    if (!bannedAttributes.includes(attribute)) {
      setBannedAttributes(prev => [...prev, attribute]);
    }
  }

  const unbanAttribute = (attribute) => {
    setBannedAttributes(prev => prev.filter(attr => attr !== attribute));
  }

  const isBanned = (pokeData) => {
    const formattedTypes = pokeData.types.map(type => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1));
    const formattedAbilities = pokeData.abilities.map(ability => ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1));
    return (
      formattedAbilities.some(ability => bannedAttributes.includes(ability)) ||
      formattedTypes.some(type => bannedAttributes.includes(type))
    )
  }
  
  const fetchPokemon = async () => {
    let attempts = 0
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * 1025) + 1; 
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomIndex}`); 
        const pokeData = await res.json();

        if (!isBanned(pokeData)) {
          const formattedName = pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1);
          const formattedTypes = pokeData.types.map(type => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1));
          const formattedAbilities = pokeData.abilities.map(ability => ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1));

          setPokemon({
            name: formattedName, 
            stats: pokeData.stats.map(stat => ({
              name: stat.stat.name,
              value: stat.base_stat
            })),
            frontSprite: pokeData.sprites.front_default,
            shinySprite: pokeData.sprites.front_shiny,
            type: formattedTypes,
            abilities: formattedAbilities
          });

          setPreviousPokemon(prev => {
            if (prev.some(p => p.name === formattedName)) {
              return prev; 
            }
            return [...prev, { name: formattedName, img: pokeData.sprites.front_default }];
          })
          return;
        }
        attempts++;
      } catch (error) {
        console.error("Error fetching Pokemon data:", error);
        setPokemon(null);
      }
    }
  }

  return (
    <>
      <div className='top-section'>
        <h1>DexDive</h1>
        <h2>The only way to become a Pokemon master!</h2>
      </div>
      <div className='right-bar'>
        <h2>Ban List</h2>
        <ul>
          {bannedAttributes.map((attr, index) => (
            <li key={index} onClick={() => unbanAttribute(attr)}>{attr}</li>
          ))}
        </ul>
        <ul className='stat-ul'>
          {displayStats.map((element, index) => (
            <li key={index} onClick={() => unbanDisplayStat(element)}>
              {element}
            </li>
          ))}
        </ul>
      </div>
      <div className='left-bar'>
          <h2>Previously seen Pokemon</h2>
          <ul>
            {previousPokemon.map((poke, index) => (
              <li key={index}>
                {poke.name} 
                <img src={poke.img} />
              </li>
            ))}
          </ul>
      </div>

      <div className='main-section'>
          <button className='base-btn' onClick={fetchPokemon}>Discover Pokemon</button>
          { pokemon && (
            <div className='pokemon-card'>
              <h2>{pokemon.name}</h2>
              <div className="pokemon-types">
                <h3>Type(s):</h3>
                <ul className='type-list'>
                  {pokemon.type.map((type, index) => (
                    <li key={index} onClick={() => banAttribute(type)}>
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
              <div className='pokemon-img'>
                <div className='pokemon-a'>
                  <h4>Normal Sprite</h4>
                  <img src={pokemon.frontSprite} alt={`${pokemon.name} front sprite`} />
                </div>
                <div className='pokemon-b'>
                  <h4>Shiny Sprite</h4>
                  <img src={pokemon.shinySprite} alt={`${pokemon.name} shiny sprite`} />
                </div>
              </div>
              <div className='pokemon-stats'>
                  <h4>Stats:</h4>
                  <ul className="stats-list">
                    {pokemon.stats.filter(stat => !displayStats.includes(stat.name))
                      .map((stat, index) => (
                      <li key={index} onClick={() => banDisplayStat(stat.name)}>
                        {stat.name}: {stat.value}
                      </li>
                    ))}
                  </ul>
              </div>
              <div className='pokemon-abilities'>
                  <h4>Abilities:</h4>
                  <ul className="ability-list"> 
                    {pokemon.abilities.map((ability, index) => (
                    <li key={index} onClick={() => banAttribute(ability)}> 
                       {ability}
                    </li>
                    ))}
                  </ul>
              </div>
            </div>
          )}
      </div>
    </>
  )
}

export default App
