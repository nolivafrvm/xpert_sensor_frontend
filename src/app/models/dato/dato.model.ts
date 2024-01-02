export class Dato {

        public valor : string;
        public fecha : Date;
        public idDato? : string;    
        public idDispositivo: string;    
        public porcentaje: string;       
        public setpoint: string;
        public idConfiguration: string;


    public constructor(init? : Partial<Dato>) {
        Object.assign(this, init);        
    }
}