export type WeatherData = {
  temp: number;
  rainProbability: number;
};

export async function getWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=36.8144&longitude=128.1211&current_weather=true&hourly=precipitation_probability&timezone=auto"
    );

    if (!res.ok) return null;

    const data = await res.json();

    return {
      temp: Math.round(data.current_weather.temperature),
      rainProbability: data.hourly?.precipitation_probability?.[0] ?? 0,
    };
  } catch {
    return null;
  }
}
