import { Component, DoCheck, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import 'highcharts/modules/xrange';
import { Dato } from 'src/app/models/dato/dato.model';
import { Novedad } from 'src/app/models/novedad/novedad.model';
import { DatoService, NovedadService } from 'src/app/services/service.index';
import { StockChart} from 'angular-highcharts';
import { StompService } from 'src/app/services/websocket/stomp.service';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',  
  styles: [
  ]
})
export class DashboardComponent implements OnInit  {

   public datos: Dato[] = [];
   public cargando: boolean = true;
   stock: StockChart;    
   
   
   // Widget Uno
   public ultimoDato:Dato = new Dato();
   public ultimaNovedad: Novedad = new Novedad();
   public porcentajeOcupacion:number;
   public porcentajeVariacion:number;
   public volumen:number = 40000;
   
   // Parametros query datos 
   public datoFechaInicio: string;
   public datoFechaFin: string;   

   // Parametros query datos 
   public novedadFechaInicio: Date;
   public novedadFechaFin: Date;
   public novedadPage:number;
   public novedadSize:number

   // Variables para graficos   
   public dataSerieStock = [];
   public receivedMessage: string;

  highchart: typeof Highcharts = Highcharts;   

  chartOptions: Highcharts.Options;   

   esCarga: boolean;   
   
  constructor(private datoService: DatoService,
   private novedadService:NovedadService,
   private stompService: StompService,
   private titleService: Title) {

  }  

  ngOnInit(): void {  
   this.titleService.setTitle('Xpert - Dashboard');
   this.crearStockChart();
   this.traerUltimoDato();   
   this.traerUltimaNovedad();
   this.datoFechaFin = new Date().toISOString();
   this.datoFechaInicio = new Date(this.getYesterday()).toISOString();      
   this.cargarDatos();  
   this.stompService.subscribe("/topic/nuevoDato", (resp:any) => {      
      this.ultimoDato = JSON.parse(resp.body);;
      this.getPorcentaje(this.ultimoDato);
   });    
 } 
 
 getPorcentajeVariacion() {
   return 0;
 }

 crearStockChart() {  
  this.chartOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Temperatura - AppSensor',
    },
    subtitle: {
      text: 'Carga y descarga',
    },
    xAxis: {
      type: 'datetime', // Tipo de eje para fechas
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%Y-%m-%d', Number(this.value));
        },
      },
      title: {
        text: 'Fecha',
      },
    },
    yAxis: {
      title: {
        text: 'Temperatura (ºC)',
      },
    },
    series: [
      {
        type: 'line',
        data: this.dataSerieStock,
      },
    ],
  };
 }


 setupDataChart(datos: Dato[]) {         
   if (this.datos) {
    this.dataSerieStock = datos.map(element => ({
      x: Date.parse(element.fecha.toString()),
      y: Number(element.valor),
    }));
  }
 }

 getYesterday(): number {
   return new Date().setDate(new Date().getDate() -365);
  }

  getPorcentaje(dato: Dato) {
   if (this.ultimoDato!=null) {      
      let ocupacion:number = Number(this.ultimoDato.valor);      
      if (Number(ocupacion) >= 0) {
         this.porcentajeOcupacion = (ocupacion/this.volumen) * 100;
      }                  
   }
  }

 traerUltimoDato() {
   this.datoService.traerUltimoDato().subscribe(dato => {
      if (dato) {
         this.ultimoDato = dato;
         this.getPorcentaje(dato);
      };
   });
 }

 traerUltimaNovedad() {
   this.novedadService.traerUltimaNovedad()
      .subscribe(novedad => {
         if (novedad) {
            this.ultimaNovedad = novedad;
            this.getPorcentajeVariacion();            
         }
      });
 }

 cargarDatos() {   
   this.cargando = true;   
   this.datoService.cargarDatos(this.datoFechaInicio, this.datoFechaFin, 0,0)
      .subscribe((datos) => {
         if (datos) {
            this.datos = datos;            
            this.setupDataChart(this.datos);  
            this.crearStockChart();                                 
         }
      });            
 } 
}

