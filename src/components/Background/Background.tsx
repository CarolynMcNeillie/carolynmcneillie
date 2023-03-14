import React, {useMemo, useEffect, useState} from "react"
import { motion } from "framer-motion";

import tiles from './tiles'
import themes from './themes'

// Setup
const cells = ['dark', 'medium', 'light']

const randomIntFromInterval = (min: number, max:number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function updateTheme(index: number) {
  const newTheme = themes[index]
  Object.keys(newTheme).forEach(key => {
    document.documentElement.style.setProperty(key, newTheme[key]);
  })
}

const currentTile = randomIntFromInterval(0, tiles.length -1)
const scheme = randomIntFromInterval(0, themes.length -1)

const generateTile = () => {
  const size = tiles[currentTile].size * 10
  return (
    <svg 
      xmlnsXlink="http://www.w3.org/1999/xlink" 
      version="1.1" xmlns="http://www.w3.org/2000/svg" 
      viewBox={`0 0 ${size} ${size}`}
      className="tile"
      >
      {tiles[currentTile].pattern.map((color, index) => {
        const xPosition = index % tiles[currentTile].size
        const yPosition = Math.floor(index / tiles[currentTile].size)
      return color > 0 ? (
        <motion.rect
          x={xPosition * 10}
          y={yPosition * 10}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: (xPosition + yPosition) * 0.1
          }}
          rx ="3"
          width="10"
          height="10"
          className={`${cells[color]}`}
          key={`cell-${index}`}
        />
      ) : ''})}
      </svg>
  )
}

const Background = () => {
  const isSSR = typeof window === "undefined"
  const tile = useMemo(generateTile, []);
  const [rowCount, setRowCount] = useState<number>();

  const updateRowCount = () => {
    const tileWidth = window.innerWidth / 7
    setRowCount(Math.ceil(window.innerHeight / tileWidth))
  };

  useEffect(() => {
    if (!isSSR) {
      updateTheme(scheme)
      updateRowCount()
      window.addEventListener('resize', updateRowCount);
    }

    return () => {
      window.removeEventListener('resize', updateRowCount);
    };
  }, [isSSR])

  const Row = () => {
    return (
      <div className="row">
        {tile}{tile}{tile}{tile}{tile}{tile}{tile}
      </div>
    )
  }

  return (
    <div className="background">
      {[...Array(rowCount)].map((el, i) => {
        const loopKey = `row-${i}`
        return (<Row key={loopKey}/>)
      })}
    </div>
  )
}

export default Background