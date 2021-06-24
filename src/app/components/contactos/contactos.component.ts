import { Component, OnInit } from '@angular/core';
import { Contacto } from '../../models/contacto';
import { ContactosService } from '../../services/contactos.service';

import { ModalDialogService } from '../../services/modal-dialog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.css']
})
export class ContactosComponent implements OnInit {
  Titulo = 'Contactos';
  TituloAccionABMC = {
    A: '(Agregar)',
    L: '(Listado)',
    C: '(Consultar)'
  };

  AccionABMC = 'L'; // inicialmente inicia en el listado de articulos (buscar con parametros)
  Mensajes = {
    SD: ' No se encontraron registros...',
    RD: ' Revisar los datos ingresados...'
  };

  submitted: boolean = false;
  FormBusqueda: FormGroup;
  FormRegistro: FormGroup;

  ListadoContactos: Contacto[] = null;
  constructor(
    public formBuilder: FormBuilder,
    private contactosService: ContactosService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormBusqueda = this.formBuilder.group({});
    this.FormRegistro = this.formBuilder.group({
      IdContacto: [null],
      Nombre: [
        null,
        [Validators.required, Validators.minLength(5), Validators.maxLength(50)]
      ],
      FechaNacimiento: [
        null,
        [
          Validators.required,
          Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          )
        ]
      ],
      Telefono: [
        null,
        [Validators.required, Validators.pattern('^\\d{1,9}$')]
      ],
      IdCategoria: [null, [Validators.required]]
    });
  }

  Buscar() {
    this.contactosService.get().subscribe((res: any) => {
      this.ListadoContactos = res;
    });
  }
  Agregar() {
    this.AccionABMC = 'A';
  }

  Consultar(Objeto) {
    this.BuscarPorId(Objeto, 'C');
  }

  BuscarPorId(Objeto, Accion) {
    window.scroll(0, 0);
    this.contactosService.getById(Objeto.IdContacto).subscribe((res: any) => {
      const itemContacto = { ...res };
      this.FormRegistro.patchValue(itemContacto);
      this.AccionABMC = Accion; 
    });
  }

  Grabar() {
    this.submitted = true;
    if (this.FormRegistro.invalid) {
      return;
    }
    const contactoNuevo = { ...this.FormRegistro.value };

    var arrFecha = contactoNuevo.FechaNacimiento.substr(0, 10).split('/');
    if (arrFecha.length == 3)
      contactoNuevo.FechaNacimiento = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    if (this.AccionABMC == 'A') {
      this.contactosService.post(contactoNuevo).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    }
  }

  Volver() {
    this.AccionABMC = 'L';
    this.submitted = false;
    this.FormRegistro.reset();
  }
}
