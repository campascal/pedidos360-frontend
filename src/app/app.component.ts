
import { Component, OnInit } from '@angular/core'
import { CommonModule, registerLocaleData } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MsalService } from '@azure/msal-angular'
import { AuthenticationResult, SilentRequest } from '@azure/msal-browser'
import localeEsCl from '@angular/common/locales/es-CL'
import { loginRequest } from './auth-config'
import { ApiService } from './api.service'
import { firstValueFrom } from 'rxjs'

registerLocaleData(localeEsCl)

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Pedidos360'

  usuario: string | null = null
  accessToken: string | null = null

  datosApi: any = null
  productos: any = null

  cargandoPedidos = false
  confirmandoPedido = false
  mensajePedido = ''

  cargandoProductos = false

  errorPedidos = ''
  errorProductos = ''

  seccionCuenta: 'pedidos' | 'catalogo' = 'pedidos'

  categoriaSeleccionada = 'Todas'
  categorias = ['Todas', 'Iluminación', 'Decoración', 'Organización', 'Textiles']

  busqueda = ''
  mostrarCategorias = false

  vista: 'inicio' | 'productos' | 'carrito' | 'cuenta' = 'inicio'

  carrito: {
    id: number
    nombre: string
    precio: number
    cantidad: number
  }[] = []

  catalogo = [
    {
      id: 1,
      nombre: 'Lámpara de mesa',
      categoria: 'Iluminación',
      precio: 24990,
      imagen: 'assets/productos/lampara.jpg',
      descripcion: 'Iluminación cálida para tus espacios'
    },
    {
      id: 2,
      nombre: 'Cojín decorativo',
      categoria: 'Decoración',
      precio: 12990,
      imagen: 'assets/productos/cojin.jpg',
      descripcion: 'Comodidad y estilo para tu living'
    },
    {
      id: 3,
      nombre: 'Repisa de madera',
      categoria: 'Organización',
      precio: 19990,
      imagen: 'assets/productos/repisa.jpg',
      descripcion: 'Organiza y decora tus paredes'
    },
    {
      id: 4,
      nombre: 'Manta de sofá',
      categoria: 'Textiles',
      precio: 15990,
      imagen: 'assets/productos/manta.jpg',
      descripcion: 'Suavidad para tus momentos de descanso'
    },
    {
      id: 5,
      nombre: 'Maceta decorativa',
      categoria: 'Decoración',
      precio: 9990,
      imagen: 'assets/productos/planta.jpg',
      descripcion: 'Un toque verde para tu hogar'
    },
    {
      id: 6,
      nombre: 'Set de canastos',
      categoria: 'Organización',
      precio: 17990,
      imagen: 'assets/productos/canastos.jpg',
      descripcion: 'Almacenamiento práctico y bonito'
    }
  ]

  get catalogoFiltrado() {
    const texto = this.normalizar(this.busqueda.trim())

    return this.catalogo.filter(producto => {
      const categoriaCorrecta =
        this.categoriaSeleccionada === 'Todas' ||
        producto.categoria === this.categoriaSeleccionada

      const contenido = this.normalizar(
        `${producto.nombre} ${producto.categoria} ${producto.descripcion}`
      )

      return categoriaCorrecta && contenido.includes(texto)
    })
  }

  normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria
    this.mostrarCategorias = false
  }

  limpiarFiltros(): void {
    this.busqueda = ''
    this.categoriaSeleccionada = 'Todas'
    this.mostrarCategorias = false
  }

  get listaPedidos(): any[] {
    const d = this.datosApi

    return Array.isArray(d)
      ? d
      : Array.isArray(d?.pedidos)
        ? d.pedidos
        : Array.isArray(d?.content)
          ? d.content
          : []
  }

  get listaProductosApi(): any[] {
    const d = this.productos

    return Array.isArray(d)
      ? d
      : Array.isArray(d?.productos)
        ? d.productos
        : Array.isArray(d?.content)
          ? d.content
          : []
  }

  get cantidadCarrito(): number {
    return this.carrito.reduce(
      (total, item) => total + item.cantidad,
      0
    )
  }

  get totalCarrito(): number {
    return this.carrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    )
  }

  agregarAlCarrito(producto: typeof this.catalogo[number]): void {
    const existente = this.carrito.find(
      item => item.id === producto.id
    )

    if (existente) {
      existente.cantidad++
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      })
    }

    this.guardarCarrito()
  }

  cambiarCantidad(id: number, cambio: number): void {
    const item = this.carrito.find(
      producto => producto.id === id
    )

    if (!item) return

    item.cantidad += cambio

    if (item.cantidad <= 0) {
      this.carrito = this.carrito.filter(
        producto => producto.id !== id
      )
    }

    this.guardarCarrito()
  }

  obtenerProducto(id: number) {
    return this.catalogo.find(
      producto => producto.id === id
    )
  }

  eliminarProducto(id: number): void {
    this.carrito = this.carrito.filter(
      producto => producto.id !== id
    )

    this.guardarCarrito()
  }

  vaciarCarrito(): void {
    this.carrito = []
    this.guardarCarrito()
  }


  async confirmarPedido(): Promise<void> {
    if (this.confirmandoPedido || this.carrito.length === 0) return

    if (!this.usuario) {
      this.mensajePedido = 'Debes iniciar sesión con Microsoft para confirmar tu compra.'
      return
    }

    this.confirmandoPedido = true
    this.mensajePedido = ''

    const items = [...this.carrito]

    try {
      for (const item of items) {
        await firstValueFrom(
          this.apiService.crearPedido({
            producto: item.nombre,
            cantidad: item.cantidad,
            total: item.precio * item.cantidad
          })
        )
      }

      this.vaciarCarrito()
      this.mensajePedido = '¡Tu pedido fue registrado correctamente!'
      this.irA('cuenta')
      this.consultarApi()
    } catch (error) {
      this.mensajePedido = 'No se pudo completar el registro. Revisa tu historial antes de intentarlo nuevamente.'
      console.error('Error al registrar pedido:', error)
    } finally {
      this.confirmandoPedido = false
    }
  }


  guardarCarrito(): void {
    localStorage.setItem(
      'pedidos360_carrito',
      JSON.stringify(this.carrito)
    )
  }

  cargarCarrito(): void {
    const guardado = localStorage.getItem('pedidos360_carrito')

    if (!guardado) return

    try {
      const datos = JSON.parse(guardado)

      if (!Array.isArray(datos)) return

      this.carrito = datos
        .filter(item =>
          Number.isInteger(item.id) &&
          Number.isInteger(item.cantidad) &&
          item.cantidad > 0 &&
          this.catalogo.some(producto => producto.id === item.id)
        )
        .map(item => {
          const producto = this.catalogo.find(
            p => p.id === item.id
          )!

          return {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: item.cantidad
          }
        })

    } catch (error) {
      console.error('Error al recuperar el carrito:', error)
      this.carrito = []
    }
  }

  irA(vista: 'inicio' | 'productos' | 'carrito' | 'cuenta'): void {
    this.vista = vista
    this.mostrarCategorias = false
  }

  constructor(
    private authService: MsalService,
    private apiService: ApiService
  ) { }

  async ngOnInit(): Promise<void> {
    this.cargarCarrito()

    await this.authService.instance.initialize()

    const response =
      await this.authService.instance.handleRedirectPromise()

    if (response?.account) {
      this.authService.instance.setActiveAccount(response.account)
    }

    const cuentaActiva =
      this.authService.instance.getActiveAccount() ??
      this.authService.instance.getAllAccounts()[0]

    if (cuentaActiva) {
      this.authService.instance.setActiveAccount(cuentaActiva)

      this.usuario = cuentaActiva.username

      const tokenRequest: SilentRequest = {
        scopes: loginRequest.scopes,
        account: cuentaActiva
      }

      try {
        const tokenResponse: AuthenticationResult =
          await this.authService.instance.acquireTokenSilent(tokenRequest)

        this.accessToken = tokenResponse.accessToken

        console.log(
          'ACCESS TOKEN OBTENIDO CORRECTAMENTE:',
          !!this.accessToken
        )

        const payload = JSON.parse(
          atob(this.accessToken.split('.')[1])
        )

        console.log('ISS DEL TOKEN:', payload.iss)
        console.log('AUD DEL TOKEN:', payload.aud)
        console.log('SCOPE DEL TOKEN:', payload.scp)

      } catch (error) {
        console.error(
          'Error al obtener el Access Token:',
          error
        )
      }
    }
  }

  consultarApi(): void {
    this.seccionCuenta = 'pedidos'
    this.cargandoPedidos = true
    this.errorPedidos = ''
    this.datosApi = null

    this.apiService.obtenerDatos().subscribe({
      next: respuesta => {
        this.cargandoPedidos = false
        this.datosApi = respuesta

        console.log(
          'RESPUESTA DEL BACKEND:',
          respuesta
        )
      },
      error: error => {
        this.cargandoPedidos = false
        this.errorPedidos = this.mensajeError(error)

        console.error(
          'ERROR AL CONSULTAR API:',
          error
        )
      }
    })
  }

  consultarProductos(): void {
    this.seccionCuenta = 'catalogo'
    this.cargandoProductos = true
    this.errorProductos = ''
    this.productos = null

    this.apiService.obtenerProductos().subscribe({
      next: respuesta => {
        this.cargandoProductos = false
        this.productos = respuesta

        console.log(
          'RESPUESTA DE PRODUCTOS:',
          respuesta
        )
      },
      error: error => {
        this.cargandoProductos = false
        this.errorProductos = this.mensajeError(error)

        console.error(
          'ERROR AL CONSULTAR PRODUCTOS:',
          error
        )
      }
    })
  }

  mensajeError(error: any): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa si el backend está activo o si hay un problema de CORS.'
    }

    if (error.status === 401) {
      return 'Tu sesión no fue autorizada (401). Revisa el token y la configuración de seguridad.'
    }

    if (error.status === 403) {
      return 'No tienes permiso para consultar esta información (403). Revisa los permisos de la API.'
    }

    if (error.status === 404) {
      return 'No se encontró el servicio solicitado (404). Revisa la ruta de API Gateway.'
    }

    return `No se pudo completar la consulta (HTTP ${error.status || 'desconocido'}).`
  }

  iniciarSesion(): void {
    this.authService.loginRedirect(loginRequest).subscribe({
      error: error => {
        console.error(
          'Error al iniciar sesión:',
          error
        )
      }
    })
  }

  cerrarSesion(): void {
    this.authService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    })
  }
}
