import 'dart:ui' show ImageFilter;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../theme.dart';
import '../tokens.dart';

class MmDestination {
  const MmDestination({required this.label, required this.icon, required this.selectedIcon});

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

/// Destinos principales de la app del taller.
const shellDestinations = [
  MmDestination(label: 'Inicio', icon: CupertinoIcons.house, selectedIcon: CupertinoIcons.house_fill),
  MmDestination(label: 'Órdenes', icon: CupertinoIcons.wrench, selectedIcon: CupertinoIcons.wrench_fill),
  MmDestination(label: 'Clientes', icon: CupertinoIcons.person_2, selectedIcon: CupertinoIcons.person_2_fill),
  MmDestination(label: 'Cobros', icon: CupertinoIcons.creditcard, selectedIcon: CupertinoIcons.creditcard_fill),
  MmDestination(label: 'Taller', icon: CupertinoIcons.gear_alt, selectedIcon: CupertinoIcons.gear_alt_fill),
];

/// Navegación adaptativa: barra de pestañas (vidrio) en teléfono — una mano —
/// y barra lateral desde tablet; en escritorio la barra se ensancha.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.currentIndex, required this.onSelect, required this.child});

  final int currentIndex;
  final ValueChanged<int> onSelect;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width < MmBreakpoints.tablet) {
      return Scaffold(
        extendBody: true,
        body: child,
        bottomNavigationBar: _TabBar(currentIndex: currentIndex, onSelect: onSelect),
      );
    }
    return Scaffold(
      body: Row(
        children: [
          _Sidebar(currentIndex: currentIndex, onSelect: onSelect, wide: width >= MmBreakpoints.desktop),
          Expanded(child: child),
        ],
      ),
    );
  }
}

/// Logotipo: cuadro azul redondeado con llave + "MechMate".
class MmLogo extends StatelessWidget {
  const MmLogo({super.key, this.size = 36});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'MechMate',
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(color: MmColors.primary, borderRadius: BorderRadius.circular(size * 0.3)),
            child: Icon(CupertinoIcons.wrench_fill, color: MmColors.surface, size: size * 0.55),
          ),
          const SizedBox(width: 10),
          // Flexible: con letra grande (Dynamic Type) el nombre se recorta, no desborda.
          Flexible(
            child: Text(
              'MechMate',
              maxLines: 1,
              softWrap: false,
              overflow: TextOverflow.fade,
              style: MmType.headline.copyWith(fontSize: size * 0.53, letterSpacing: -0.3),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabBar extends StatelessWidget {
  const _TabBar({required this.currentIndex, required this.onSelect});

  final int currentIndex;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: MmColors.surface.withValues(alpha: 0.78),
            border: const Border(top: BorderSide(color: Color(0x0F0F172A))),
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 52,
              child: Row(
                children: [
                  for (var i = 0; i < shellDestinations.length; i++)
                    Expanded(
                      child: _TabItem(
                        destination: shellDestinations[i],
                        selected: i == currentIndex,
                        onTap: () => onSelect(i),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabItem extends StatelessWidget {
  const _TabItem({required this.destination, required this.selected, required this.onTap});

  final MmDestination destination;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? MmColors.primary : MmColors.inkTertiary;
    return Semantics(
      selected: selected,
      button: true,
      label: destination.label,
      excludeSemantics: true,
      child: InkResponse(
        onTap: onTap,
        splashFactory: NoSplash.splashFactory,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(selected ? destination.selectedIcon : destination.icon, color: color, size: 24),
            const SizedBox(height: 2),
            Text(
              destination.label,
              style: MmType.caption.copyWith(
                fontSize: 11,
                height: 13 / 11,
                color: color,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Sidebar extends StatelessWidget {
  const _Sidebar({required this.currentIndex, required this.onSelect, required this.wide});

  final int currentIndex;
  final ValueChanged<int> onSelect;
  final bool wide;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: wide ? 264 : 232,
      decoration: const BoxDecoration(
        color: MmColors.surface,
        border: Border(right: BorderSide(color: MmColors.separator)),
      ),
      child: SafeArea(
        right: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(MmSpace.l, MmSpace.xl, MmSpace.l, MmSpace.l),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: MmSpace.s),
                child: MmLogo(),
              ),
              const SizedBox(height: MmSpace.x3),
              for (var i = 0; i < shellDestinations.length; i++) ...[
                _SidebarItem(destination: shellDestinations[i], selected: i == currentIndex, onTap: () => onSelect(i)),
                const SizedBox(height: MmSpace.xs),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SidebarItem extends StatefulWidget {
  const _SidebarItem({required this.destination, required this.selected, required this.onTap});

  final MmDestination destination;
  final bool selected;
  final VoidCallback onTap;

  @override
  State<_SidebarItem> createState() => _SidebarItemState();
}

class _SidebarItemState extends State<_SidebarItem> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final selected = widget.selected;
    final bg = selected ? MmColors.primaryTint : (_hover ? MmColors.fill : Colors.transparent);
    return Semantics(
      selected: selected,
      button: true,
      label: widget.destination.label,
      excludeSemantics: true,
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(
          onTap: widget.onTap,
          onHover: (v) => setState(() => _hover = v),
          borderRadius: BorderRadius.circular(12),
          splashFactory: NoSplash.splashFactory,
          highlightColor: Colors.transparent,
          focusColor: MmColors.primary.withValues(alpha: 0.10),
          child: AnimatedContainer(
            duration: MmMotion.state,
            height: MmSpace.minTouch,
            padding: const EdgeInsets.symmetric(horizontal: MmSpace.m),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
            child: Row(
              children: [
                Icon(
                  selected ? widget.destination.selectedIcon : widget.destination.icon,
                  size: 22,
                  color: selected ? MmColors.primaryText : MmColors.inkSecondary,
                ),
                const SizedBox(width: MmSpace.m),
                Text(
                  widget.destination.label,
                  style: MmType.callout.copyWith(
                    color: selected ? MmColors.primaryText : MmColors.ink,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
