# MechMate — guía de diseño (app)

Estilo **iOS / Apple-like en todas las plataformas**: limpio, premium, mucho espacio en blanco.
Código fuente de la verdad: `lib/ui/tokens.dart` (valores) y `lib/ui/theme.dart` (tema).
Ningún widget usa colores, radios o sombras sueltos: siempre tokens.

## Principios

1. **Confianza visible.** Estados claros, precio antes de actuar, nada de sorpresas en el cobro.
2. **Una sola mano.** En teléfono, la acción principal va abajo, al alcance del pulgar.
3. **Un botón principal por pantalla.** Lo secundario en botón tonal (`MmButton.secondary`) o texto (`MmButton.ghost`).
4. **Pocos pasos, mensajes humanos.** "No pudimos conectar", no "Error 503".

## Tokens

| Rol | Token | Valor | Uso |
|---|---|---|---|
| Acción | `primary` | `#0B63F6` | Único color de acción. Texto blanco encima (5.1:1). |
| Acción (texto) | `primaryText` | `#0B4FC4` | Azul para texto/íconos sobre blanco o tinte. |
| Texto | `ink` / `inkSecondary` / `inkTertiary` | `#0B1220` / `#5B6472` / `#667085` | Jerarquía de texto (todos AA sobre el fondo). |
| Fondo | `background` / `surface` | `#F5F6F8` / `#FFFFFF` | Gris muy suave de fondo, tarjetas blancas. |
| Éxito | `successText` sobre `successTint` | `#146C3B` / `#E7F6EC` | Confirmado, disponible, pagado. `success` solo en íconos. |
| Alerta | `danger` / `dangerText` | `#D92D20` / `#B42318` | **Solo** errores y acciones destructivas. |

- **Tipografía:** SF Pro (sistema) en iPhone/iPad; Geist (OFL, incluida) en Android y web.
  Escala de iOS: Large Title 34, Title 1 28, Title 2 22, Title 3 20, Headline 17 semibold, Body 17,
  Subhead 15, Footnote 13, Caption 12. Montos con cifras tabulares (`MmType.money`).
- **Espaciado:** grilla de 4 pt (4, 8, 12, 16, 20, 24, 32, 40, 48). Márgenes: 20 teléfono, 24 tablet, 32 escritorio.
- **Radios:** 10 chips, 16 botones e inputs, 22 tarjetas, 28 hojas y modales.
- **Sombras:** suaves, de dos capas (`MmShadows.card`). El botón principal proyecta sombra azul y se aplana al presionar.
- **Vidrio:** solo en la barra de pestañas (y hojas flotantes): blanco al 78 % + desenfoque de 24.

## Componentes (`lib/ui/widgets/`)

| Componente | Estados que DEBE cubrir |
|---|---|
| `MmButton` (principal / secundario / ghost) | normal, hover, presionado (escala 0.97 + color), deshabilitado, cargando (no acepta toques y se anuncia "…, cargando"), foco de teclado |
| `MmCard` | reposo, presionada (escala 0.98) si es tocable, foco |
| `MmBadge` (success / info / neutral / danger) | siempre con texto; punto o ícono opcional |
| `MmEmptyState` / `MmErrorState` / `MmSkeleton` | vacío con acción; error con "Reintentar"; carga con esqueleto (nunca spinner a pantalla completa) |
| `AppShell` | teléfono: barra de pestañas; ≥ 700 pt: barra lateral; ≥ 1100 pt: barra lateral ancha |
| `MmPage` | título grande, márgenes por tamaño, contenido ≤ 1280 pt |

Inputs: tema global (`inputDecorationTheme`): activo (borde azul 2 pt), error (rojo + mensaje), deshabilitado.

## Comportamiento iOS en todas las plataformas

- Sin ripple: la respuesta al toque es escala y color.
- Transiciones de página de iOS (deslizar para volver) y rebote al hacer scroll.
- Háptica ligera en iPhone al tocar la acción principal.
- Íconos: `CupertinoIcons` (estilo SF Symbols), contorno cuando no está seleccionado y relleno cuando sí.

## Checklist por pantalla (revisión antes de cerrar la tarea)

- [ ] Un solo botón principal, fijo abajo en teléfono.
- [ ] Todo lo tocable ≥ 44 × 44 pt.
- [ ] Estados de carga, vacío y error diseñados (no solo el camino feliz).
- [ ] Textos con contraste AA; el estado nunca se comunica solo por color.
- [ ] Íconos sin texto con `Semantics`/tooltip; orden de lectura lógico.
- [ ] Probado a 390 pt (teléfono), 1024 pt (tablet) y 1440 pt (web).
- [ ] Letra grande (Dynamic Type): nada se corta ni desborda.
- [ ] Montos en RD$ con el formato de la API (centavos → pesos) y cifras tabulares.
- [ ] Tests de widget en iOS y Android (`TargetPlatformVariant`).
