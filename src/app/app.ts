import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit  {
  villeChoisie = 'Dakar';
  recherche = '';
  chargement = true;

  villes: any[] = [
    { nom: 'Dakar', lat: 14.7167, lon: -17.4677, temp: 0, humidite: 0, vent: 0, ressenti: '', icone: '☀️', conseil: '', heures: [], jours: [] },
    { nom: 'Thiès', lat: 14.7917, lon: -16.9278, temp: 0, humidite: 0, vent: 0, ressenti: '', icone: '☀️', conseil: '', heures: [], jours: [] },
    { nom: 'Saint-Louis', lat: 16.0179, lon: -16.4896, temp: 0, humidite: 0, vent: 0, ressenti: '', icone: '☀️', conseil: '', heures: [], jours: [] },
    { nom: 'Ziguinchor', lat: 12.5833, lon: -16.2667, temp: 0, humidite: 0, vent: 0, ressenti: '', icone: '☀️', conseil: '', heures: [], jours: [] },
    { nom: 'Kaolack', lat: 14.15, lon: -16.0667, temp: 0, humidite: 0, vent: 0, ressenti: '', icone: '☀️', conseil: '', heures: [], jours: [] },
    { nom: 'Touba', lat: 14.8667, lon: -15.8833, temp: 0, humidite: 0, vent: 0, ressenti: '', icone: '☀️', conseil: '', heures: [], jours: [] }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.villes.forEach(v => this.chargerMeteo(v));
  }

  chargerMeteo(ville: any) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ville.lat}&longitude=${ville.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FDakar&forecast_days=7`;
    this.http.get<any>(url).subscribe(data => {
      const c = data.current;
      ville.temp = Math.round(c.temperature_2m);
      ville.humidite = c.relative_humidity_2m;
      ville.vent = Math.round(c.wind_speed_10m);
      const info = this.traduireCode(c.weather_code, ville.temp);
      ville.ressenti = info.texte;
      ville.icone = info.icone;
      ville.conseil = info.conseil;
      ville.heures = data.hourly.time.slice(0, 6).map((t: string, i: number) => ({
        heure: t.slice(11, 16),
        temp: Math.round(data.hourly.temperature_2m[i]),
        icone: this.traduireCode(data.hourly.weather_code[i], 25).icone
      }));
      const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      ville.jours = data.daily.time.map((t: string, i: number) => ({
        jour: i === 0 ? "Aujourd'hui" : jours[new Date(t).getDay()],
        max: Math.round(data.daily.temperature_2m_max[i]),
        min: Math.round(data.daily.temperature_2m_min[i]),
        icone: this.traduireCode(data.daily.weather_code[i], 25).icone
      }));
      this.chargement = false;
    }, error => {
      console.error('Erreur API:', error);
      ville.conseil = '⚠️ Impossible de charger la météo. Vérifiez votre connexion.';
      ville.ressenti = 'Erreur de connexion';
      ville.icone = '❌';
      this.chargement = false;
    });
  }

  traduireCode(code: number, temp: number) {
    if (code === 0) return { texte: 'Ciel dégagé', icone: '☀️', conseil: 'Belle journée pour la plage !' };
    if (code <= 2) return { texte: 'Ensoleillé / Quelques nuages', icone: '🌤️', conseil: 'Belle journée, profitez !' };
    if (code === 3) return { texte: 'Nuageux', icone: '☁️', conseil: 'Ciel couvert, mais pas de pluie.' };
    if (code <= 48) return { texte: 'Brouillard', icone: '🌫️', conseil: 'Faites attention sur la route.' };
    if (code <= 67) return { texte: 'Pluie', icone: '🌧️', conseil: 'Prenez un parapluie !' };
    if (code <= 77) return { texte: 'Neige / Grêle', icone: '🌨️', conseil: 'Restez à l’abri.' };
    if (code <= 82) return { texte: 'Averses', icone: '🌦️', conseil: 'Petite pluie possible.' };
    if (code >= 95) return { texte: 'Orage', icone: '⛈️', conseil: 'Orage, restez à l’intérieur !' };
    if (temp >= 33) return { texte: 'Très chaud', icone: '🔥', conseil: 'Buvez beaucoup d’eau.' };
    return { texte: 'Beau temps', icone: '🌞', conseil: 'Bonne journée !' };
  }

  get villeActuelle() {
    return this.villes.find(v => v.nom === this.villeChoisie) || this.villes[0];
  }

  choisir(nom: string) {
    this.villeChoisie = nom;
    this.chargerMeteo(this.villeActuelle);
  }

  chercher() {
    this.villeChoisie = this.recherche;
  }
}