const express = require('express')
const path = require('path');
const app = express()
const router = express.Router();
const axios = require('axios')
require('dotenv').config();
const apiKey = process.env.API_KEY
let currPokemonUrl = ""

app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages')))

router.get('/', (req, res) => {
    res.render(('index', { root: __dirname }))
})

router.get('/temperatura/:cidade', async (req, res) => {
    const cidade = encodeURIComponent(req.params.cidade)
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric`)
    const data = response.data
    let isRaining = false

    if (data.weather.length > 0) {
        isRaining = data.weather[0].main === 'Rain'
    }

    return res.status(200).json({
        isRaining: isRaining,
        temp: data.main.temp
    })
})

router.post('/pokemon', async (req, res) => {
    const temperatura = Math.floor(req.body.temp)
    const isRaining = req.body.isRaining
    let url = ""

    if (isRaining) {
        url = "https://www.pokemon.com/br/api/pokedex/electric"
    } else if (temperatura === 20) {
        url = "https://www.pokemon.com/br/api/pokedex"
    } else if (temperatura >= 27) {
        url = "https://www.pokemon.com/br/api/pokedex/fire"
    } else if (temperatura <= 10) {
        url = "https://www.pokemon.com/br/api/pokedex/ice"
    } else {
        url = "https://www.pokemon.com/br/api/pokedex"
    }

    const response = await axios.get(url)
    const data = response.data
    
    let pokemon

    do {
        const size = data.length
        const randomIndex = Math.floor(Math.random() * size)
        pokemon = data[randomIndex]
    } while (pokemon.ThumbnailImage === currPokemonUrl)

    currPokemonUrl = pokemon.ThumbnailImage

    return res.json({url: currPokemonUrl, name: pokemon.name})
})

app.use(router)

app.listen(8000)