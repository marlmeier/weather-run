/* app.jsx — root: live Wizard-of-Oz context toolbar + design canvas with the
   3 hi-fi directions side by side. Shared state drives all three. */

function ContextToolbar({ weather, location, setWeather, setLocation }) {
  const wrap = { position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
    display: 'flex', alignItems: 'center', gap: 14, background: '#16130f', color: '#fff',
    padding: '9px 9px 9px 16px', borderRadius: 16, boxShadow: '0 10px 34px rgba(0,0,0,.32)',
    fontFamily: "'Archivo', system-ui, sans-serif" };
  const grpL = { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', fontWeight: 700, marginRight: 2 };
  const seg = (val, cur, set, label) => (
    <button onClick={() => set(val)} style={{ border: 'none', cursor: 'pointer', padding: '7px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13,
      fontFamily: 'inherit', background: cur === val ? '#ff5a24' : 'rgba(255,255,255,.08)', color: cur === val ? '#16130f' : 'rgba(255,255,255,.8)' }}>{label}</button>);
  return (
    <div style={wrap}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: .3, color: 'rgba(255,255,255,.85)' }}>CONTEXT</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={grpL}>Sky</span>
        <div style={{ display: 'flex', gap: 4 }}>{seg('sunny', weather, setWeather, 'Sunny')}{seg('rainy', weather, setWeather, 'Rainy')}{seg('windy', weather, setWeather, 'Windy')}</div>
      </div>
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.14)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={grpL}>Terrain</span>
        <div style={{ display: 'flex', gap: 4 }}>{seg('city', location, setLocation, 'City')}{seg('trail', location, setLocation, 'Steep Trail')}</div>
      </div>
    </div>);
}

function App() {
  const { DesignCanvas, DCSection, DCArtboard, PerformanceScreen, EditorialScreen, WeatherScreen } = window;
  const load = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const [weather, setWeatherS] = React.useState(load('p4hifi-w', 'windy'));
  const [location, setLocationS] = React.useState(load('p4hifi-l', 'trail'));
  const setWeather = (v) => { setWeatherS(v); try { localStorage.setItem('p4hifi-w', v); } catch (e) {} };
  const setLocation = (v) => { setLocationS(v); try { localStorage.setItem('p4hifi-l', v); } catch (e) {} };
  const state = window.ENGINE.derive(weather, location);
  const W = 402, H = 874, radius = { borderRadius: 46 };

  return (
    <React.Fragment>
      <ContextToolbar weather={weather} location={location} setWeather={setWeather} setLocation={setLocation} />
      <DesignCanvas>
        <DCSection id="p4-hifi" title="Proto 4 — Build Your Run" subtitle="Hi-fi · three visual directions · one shared live context">
          <DCArtboard id="perf" label="1 · Performance" width={W} height={H} style={radius}>
            <PerformanceScreen state={state} />
          </DCArtboard>
          <DCArtboard id="edit" label="2 · Editorial" width={W} height={H} style={radius}>
            <EditorialScreen state={state} />
          </DCArtboard>
          <DCArtboard id="wx" label="3 · Weather Canvas" width={W} height={H} style={radius}>
            <WeatherScreen state={state} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </React.Fragment>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
