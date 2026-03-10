 const API_BASE = 'https://api.weatherapi.com/v1/current.json';
    const API_KEY = '3aef6ffd51f648d3aea183008250510';

    const locInput = document.getElementById('locationInput');
    const searchBtn = document.getElementById('searchBtn');
    const geoBtn = document.getElementById('geoBtn');
    const message = document.getElementById('message');
    const resultCard = document.getElementById('resultCard');
    const locName = document.getElementById('locName');
    const localTime = document.getElementById('localTime');
    const tempText = document.getElementById('tempText');
    const conditionText = document.getElementById('conditionText');
    const icon = document.getElementById('icon');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const aqi = document.getElementById('aqi');

    function setMessage(msg, isError=false){
      message.textContent = msg || '';
      message.classList.toggle('error', !!isError);
    }

    function showLoading(){
      setMessage('Loading...');
      searchBtn.disabled = true;
      geoBtn.disabled = true;
    }
    function hideLoading(){
      searchBtn.disabled = false;
      geoBtn.disabled = false;
      setMessage('');
    }

    async function fetchWeather(q){
      try{
        showLoading();
        const url = `${API_BASE}?key=${encodeURIComponent(API_KEY)}&q=${encodeURIComponent(q)}&aqi=yes`;
        const res = await fetch(url);
        if(!res.ok){
          const txt = await res.text();
          throw new Error('API error: ' + res.status + ' ' + txt);
        }
        const data = await res.json();
        hideLoading();
        return data;
      }catch(err){
        hideLoading();
        throw err;
      }
    }

    function render(data){
      if(!data) return;
      resultCard.style.display = 'block';
      locName.textContent = `${data.location.name}, ${data.location.region || data.location.country}`;
      localTime.textContent = `Local time: ${data.location.localtime}`;
      tempText.textContent = `${data.current.temp_c}°C / ${data.current.temp_f}°F`;
      conditionText.textContent = data.current.condition.text;
      icon.src = 'https:' + data.current.condition.icon;
      icon.alt = data.current.condition.text;
      feelsLike.textContent = `${data.current.feelslike_c}°C / ${data.current.feelslike_f}°F`;
      humidity.textContent = data.current.humidity;
      wind.textContent = `${data.current.wind_kph} kph (${data.current.wind_dir})`;
      aqi.textContent = (data.current.air_quality && data.current.air_quality['us-epa-index']) ? data.current.air_quality['us-epa-index'] : 'N/A';
    }

    async function handleSearch(){
      const q = locInput.value.trim();
      if(!q){ setMessage('Please enter a location', true); return; }
      setMessage('');
      try{
        const data = await fetchWeather(q);
        render(data);
      }catch(err){
        console.error(err);
        setMessage('Could not fetch weather. Check location or your API key and CORS/mixed-content settings.', true);
        resultCard.style.display = 'none';
      }
    }

    function useGeolocation(){
      if(!navigator.geolocation){ setMessage('Geolocation not supported by this browser.', true); return; }
      setMessage('Requesting device location...');
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        locInput.value = `${lat},${lon}`;
        try{
          const data = await fetchWeather(locInput.value);
          render(data);
          setMessage('');
        }catch(err){
          console.error(err);
          setMessage('Failed to fetch weather for your location.', true);
        }
      }, (err) => {
        console.warn(err);
        setMessage('Permission denied or unavailable.', true);
      }, {timeout:10000});
    }

    searchBtn.addEventListener('click', handleSearch);
    locInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') handleSearch(); });
    geoBtn.addEventListener('click', useGeolocation);