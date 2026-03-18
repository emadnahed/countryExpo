import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import type { Country } from '@/features/countries/countriesSlice';
import { Colors } from '@/utils/theme';
import {
  LEAFLET_CSS,
  LEAFLET_JS,
  MARKER_CLUSTER_CSS,
  MARKER_CLUSTER_DEFAULT_CSS,
  MARKER_CLUSTER_JS,
} from '@/assets/leafletBundle';

export interface LeafletMapHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  closePopup: () => void;
}

interface LeafletMapProps {
  countries: Country[];
  onCountryPress: (cca3: string) => void;
  testID?: string;
}

type MarkerData = {
  cca3: string;
  name: string;
  region: string;
  population: number;
  flagUrl: string;
  latlng: [number, number];
};

// Swap the w320 flag URL for a smaller w40 thumbnail — saves ~80% bandwidth per marker
function smallFlag(flagPng: string): string {
  return flagPng.replace(/\/w\d+\//, '/w40/');
}

/*
 * Injected before the HTML loads — sets up a console bridge that pipes every
 * console.log/warn/error and window.onerror from inside the WebView back to
 * the React Native onMessage handler as { type: 'LOG', level, msg } payloads.
 *
 * This runs before Leaflet, before our IIFE, so nothing slips through.
 */
const CONSOLE_BRIDGE = `(function () {
  function post(level, args) {
    var msg = Array.prototype.slice.call(args)
      .map(function (a) {
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
        catch (e) { return '[unserializable]'; }
      })
      .join(' ');
    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'LOG', level: level, msg: msg })
      );
    } catch (e) {}
  }

  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () {
      post(level, arguments);
      if (orig) orig.apply(console, arguments);
    };
  });

  window.onerror = function (msg, src, line, col) {
    post('error', ['[window.onerror] ' + msg + ' at ' + src + ':' + line + ':' + col]);
    return false;
  };

  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason && e.reason.message ? e.reason.message : String(e.reason);
    post('error', ['[unhandledrejection] ' + reason]);
  });

  console.log('[LeafletMap] console bridge installed');
}());
true;`;

/*
 * Builds the complete HTML document for the map. All Leaflet JS/CSS is
 * inlined from the local bundle — no CDN requests, works offline and in
 * iOS Simulator without network quirks.
 *
 * WebView ↔ RN message protocol
 * ──────────────────────────────
 * WebView → RN  (window.ReactNativeWebView.postMessage):
 *   { type: 'MAP_READY' }
 *   { type: 'COUNTRY_PRESS', payload: { cca3 } }
 *   { type: 'MAP_ERROR',     payload: { message } }
 *   { type: 'LOG',           level: 'log'|'warn'|'error', msg: string }
 *
 * RN → WebView  (injectJavaScript):
 *   window.flyTo(lat, lng, zoom)
 *   window.closePopup()
 *   window.setTheme(isDark: boolean)
 */
function buildLeafletHTML(markers: MarkerData[], isDark: boolean): string {
  const tile = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const c = {
    bg:      isDark ? '#000000' : '#F5F5F7',
    surface: isDark ? '#1D1D1F' : '#FFFFFF',
    text:    isDark ? '#F5F5F7' : '#1D1D1F',
    sec:     '#86868B',
    border:  isDark ? '#333336' : '#E5E5EA',
    chip:    isDark ? '#2C2C2E' : '#F0F0F5',
    btnBg:   isDark ? '#F5F5F7' : '#1D1D1F',
    btnTxt:  isDark ? '#1D1D1F' : '#F5F5F7',
    shadow:  isDark ? '0.5' : '0.14',
  };

  const markersJSON = JSON.stringify(markers).replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

  <!-- All Leaflet CSS inlined — no network requests needed -->
  <style>${LEAFLET_CSS}</style>
  <style>${MARKER_CLUSTER_CSS}${MARKER_CLUSTER_DEFAULT_CSS}</style>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { height: 100%; width: 100%; background: ${c.bg}; }

    /* Flag pin markers */
    .lm { display: flex; flex-direction: column; align-items: center; }
    .lm-flag {
      width: 30px; height: 21px; border-radius: 4px; object-fit: cover;
      box-shadow: 0 2px 6px rgba(0,0,0,${isDark ? '0.5' : '0.25'});
      border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)'};
      transition: transform 0.15s ease;
    }
    .lm-pin {
      width: 2px; height: 9px; margin-top: 1px; border-radius: 1px;
      background: ${isDark ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.35)'};
    }

    /* Popup shell */
    .leaflet-popup-content-wrapper {
      background: ${c.surface}; color: ${c.text};
      border-radius: 20px; border: 1px solid ${c.border};
      box-shadow: 0 16px 48px rgba(0,0,0,${c.shadow}), 0 4px 12px rgba(0,0,0,0.08);
      padding: 0; overflow: hidden; min-width: 230px;
    }
    .leaflet-popup-content { margin: 0; width: 100% !important; }
    .leaflet-popup-tip-container { display: none; }
    .leaflet-popup-close-button {
      right: 12px !important; top: 12px !important;
      color: ${c.sec} !important; font-size: 22px !important;
      font-weight: 300 !important; width: 28px !important;
      height: 28px !important; line-height: 28px !important;
      text-align: center !important; z-index: 10;
    }

    /* Popup card content */
    .pc { padding: 16px; }
    .pc-hero {
      width: 100%; height: 90px; object-fit: cover;
      border-radius: 12px; margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .pc-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .pc-thumb { width: 38px; height: 26px; border-radius: 5px; object-fit: cover; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
    .pc-name { font-size: 16px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; color: ${c.text}; line-height: 1.2; }
    .pc-region { font-size: 11px; color: ${c.sec}; font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin-top: 2px; letter-spacing: 0.2px; text-transform: uppercase; }
    .pc-chips { display: flex; gap: 7px; margin-bottom: 14px; flex-wrap: wrap; }
    .pc-chip { background: ${c.chip}; border-radius: 8px; padding: 6px 10px; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: ${c.text}; }
    .pc-chip b { font-weight: 700; }
    .pc-chip span { color: ${c.sec}; font-size: 10px; display: block; margin-top: 1px; }
    .pc-btn {
      width: 100%; padding: 12px; border: none; border-radius: 13px;
      background: ${c.btnBg}; color: ${c.btnTxt};
      font-size: 14px; font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      cursor: pointer; letter-spacing: -0.2px;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: opacity 0.1s ease;
    }
    .pc-btn:active { opacity: 0.75; }

    /* Cluster flag grid — up to 4 member flags, no number badge */
    .cf-wrap { display: flex; flex-direction: column; align-items: center; }
    .cf-grid {
      display: grid;
      grid-template-columns: repeat(2, 22px);
      gap: 2px;
      padding: 4px;
      background: ${isDark ? '#1D1D1F' : '#FFFFFF'};
      border-radius: 10px;
      border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
      box-shadow: 0 2px 10px rgba(0,0,0,${isDark ? '0.40' : '0.16'});
    }
    .cf-grid.one { grid-template-columns: 22px; }
    .cf-grid.two { grid-template-columns: repeat(2, 22px); grid-template-rows: 15px; }
    .cf-img { width: 22px; height: 15px; border-radius: 3px; object-fit: cover; display: block; }
    .cf-pin {
      width: 2px; height: 8px; margin-top: 1px; border-radius: 1px;
      background: ${isDark ? 'rgba(245,245,247,0.5)' : 'rgba(29,29,31,0.35)'};
    }

    /* Zoom controls — bottom-right so they don't conflict with the search bar */
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 4px 20px rgba(0,0,0,${isDark ? '0.45' : '0.12'}) !important;
      margin-bottom: 48px !important;
      margin-right: 16px !important;
    }
    .leaflet-control-zoom a {
      background: ${c.surface} !important; color: ${c.text} !important;
      border: 1px solid ${c.border} !important;
      font-size: 18px !important; width: 38px !important;
      height: 38px !important; line-height: 36px !important;
    }
    .leaflet-control-zoom a:first-child { border-radius: 12px 12px 0 0 !important; }
    .leaflet-control-zoom a:last-child  { border-radius: 0 0 12px 12px !important; }
    .leaflet-control-attribution {
      background: ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)'} !important;
      color: ${c.sec} !important; backdrop-filter: blur(10px);
      border-radius: 10px 0 0 0 !important; font-size: 9px !important;
      padding: 3px 6px !important; margin: 0 !important;
    }
    .leaflet-control-attribution a { color: ${c.sec} !important; }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Leaflet core + cluster plugin — inlined, zero CDN dependency -->
  <script>${LEAFLET_JS}</script>
  <script>${MARKER_CLUSTER_JS}</script>

  <script>
    (function () {
      var DATA = ${markersJSON};

      console.log('[LeafletMap] init — L available:', typeof L !== 'undefined');
      console.log('[LeafletMap] marker count:', DATA.length);

      function send(obj) {
        try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); }
        catch (e) { /* not yet in RN context — ignore */ }
      }

      function fmt(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
        return '' + n;
      }

      // Map
      var map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      console.log('[LeafletMap] L.map created');

      var tileLayer = L.tileLayer('${tile}', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayer.on('tileload',  function () { console.log('[tiles] first tile loaded'); });
      tileLayer.on('tileerror', function (e) { console.warn('[tiles] tile error at', JSON.stringify(e.coords)); });
      console.log('[LeafletMap] tile layer added');

      // Cluster group — custom icon renders a small flag grid instead of a number badge
      var clusters = L.markerClusterGroup({
        maxClusterRadius: 55,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        chunkedLoading: true,
        chunkInterval: 50,
        chunkDelay: 50,
        iconCreateFunction: function (cluster) {
          var children = cluster.getAllChildMarkers();
          var n = Math.min(children.length, 4);
          var flags = [];
          for (var i = 0; i < n; i++) {
            var iconHtml = children[i].options.icon.options.html;
            var match = iconHtml.match(/src="([^"]+)"/);
            if (match) flags.push(match[1]);
          }
          var imgTags = flags.map(function (src) {
            return '<img class="cf-img" src="' + src + '" loading="lazy"/>';
          }).join('');
          var gridClass = n === 1 ? 'one' : n === 2 ? 'two' : '';
          var w = n === 1 ? 30 : 54;
          var h = n > 2 ? 49 : 32;
          var html = '<div class="cf-wrap">'
            + '<div class="cf-grid ' + gridClass + '">' + imgTags + '</div>'
            + '<div class="cf-pin"></div>'
            + '</div>';
          return L.divIcon({
            html: html,
            className: '',
            iconSize: [w, h],
            iconAnchor: [w / 2, h],
          });
        },
      });

      function makeIcon(flagUrl) {
        return L.divIcon({
          html: '<div class="lm"><img class="lm-flag" src="' + flagUrl + '" loading="lazy"/><div class="lm-pin"></div></div>',
          className: '',
          iconSize: [30, 32],
          iconAnchor: [15, 32],
          popupAnchor: [0, -34],
        });
      }

      function makePopup(c) {
        var heroUrl = c.flagUrl.replace('/w40/', '/w160/');
        return '<div class="pc">'
          + '<img class="pc-hero" src="' + heroUrl + '" loading="lazy"/>'
          + '<div class="pc-row">'
            + '<img class="pc-thumb" src="' + c.flagUrl + '"/>'
            + '<div>'
              + '<div class="pc-name">' + c.name + '</div>'
              + '<div class="pc-region">' + c.region + '</div>'
            + '</div>'
          + '</div>'
          + '<div class="pc-chips">'
            + '<div class="pc-chip"><b>' + fmt(c.population) + '</b><span>Population</span></div>'
          + '</div>'
          + '<button class="pc-btn" data-cca3="' + c.cca3 + '">'
            + 'Explore Country'
            + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
              + '<path d="M5 12h14M12 5l7 7-7 7"/>'
            + '</svg>'
          + '</button>'
          + '</div>';
      }

      DATA.forEach(function (c) {
        L.marker([c.latlng[0], c.latlng[1]], { icon: makeIcon(c.flagUrl) })
          .bindPopup(makePopup(c), { maxWidth: 270, closeButton: true })
          .addTo(clusters);
      });
      map.addLayer(clusters);
      console.log('[LeafletMap] all markers added to cluster group');

      // RN bridge — called via injectJavaScript from the native side
      window.onPress = function (cca3) {
        map.closePopup();
        send({ type: 'COUNTRY_PRESS', payload: { cca3: cca3 } });
      };

      // Delegated handler for popup "Explore" buttons.
      // Using data-cca3 avoids inline onclick strings (which break inside template literals).
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-cca3]');
        if (btn) window.onPress(btn.getAttribute('data-cca3'));
      });

      window.flyTo = function (lat, lng, zoom) {
        console.log('[LeafletMap] flyTo', lat, lng, zoom);
        map.flyTo([lat, lng], zoom || 5, { duration: 1.2, easeLinearity: 0.35 });
      };

      window.closePopup = function () {
        map.closePopup();
      };

      window.setTheme = function (dark) {
        tileLayer.setUrl(
          dark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        );
      };

      send({ type: 'MAP_READY' });
      console.log('[LeafletMap] MAP_READY sent — init complete');
    }());
  </script>
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>(
  function LeafletMap({ countries, onCountryPress, testID }, ref) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    const markers = useMemo<MarkerData[]>(
      () =>
        countries
          .filter(c => c.latlng?.length === 2)
          .map(c => ({
            cca3: c.cca3,
            name: c.name.common,
            region: c.region,
            population: c.population,
            flagUrl: smallFlag(c.flags.png),
            latlng: c.latlng as [number, number],
          })),
      [countries],
    );

    // Rebuild the full HTML when the country list changes.
    // Theme changes are pushed via injectJavaScript so we don't reload the page.
    const html = useMemo(
      () => buildLeafletHTML(markers, isDark),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [markers],
    );

    useEffect(() => {
      if (!isMapReady) return;
      webViewRef.current?.injectJavaScript(`window.setTheme(${isDark}); true;`);
    }, [isDark, isMapReady]);

    useImperativeHandle(ref, () => ({
      flyTo(lat, lng, zoom = 5) {
        webViewRef.current?.injectJavaScript(
          `window.flyTo(${lat}, ${lng}, ${zoom}); true;`,
        );
      },
      closePopup() {
        webViewRef.current?.injectJavaScript(`window.closePopup(); true;`);
      },
    }));

    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);

          if (msg.type === 'MAP_READY') {
            setIsMapReady(true);
          } else if (msg.type === 'COUNTRY_PRESS') {
            onCountryPress(msg.payload.cca3);
          } else if (msg.type === 'MAP_ERROR') {
            console.error('[LeafletMap] MAP_ERROR:', msg.payload?.message);
            setHasError(true);
          } else if (msg.type === 'LOG') {
            // Route WebView console output to the RN console so it shows in Metro
            const icon = msg.level === 'error' ? '🔴' : msg.level === 'warn' ? '🟡' : '🔵';
            console.log(`${icon} [WebView] ${msg.msg}`);
          }
        } catch (err) {
          console.error('[LeafletMap] failed to parse WebView message:', err, event.nativeEvent.data);
        }
      },
      [onCountryPress],
    );

    if (hasError) {
      return (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Map failed to load.{'\n'}Check your internet connection.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container} testID={testID}>
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl: 'https://localhost' }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          // Runs before the HTML document loads — sets up the console bridge
          // so even early parse errors are captured and sent to onMessage.
          injectedJavaScriptBeforeContentLoaded={CONSOLE_BRIDGE}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={e => {
            console.error('[LeafletMap] WebView onError:', e.nativeEvent.description);
            setIsLoading(false);
            setHasError(true);
          }}
          onMessage={onMessage}
          renderToHardwareTextureAndroid
          allowsBackForwardNavigationGestures={false}
          testID="leaflet-webview"
        />

        {isLoading && (
          <View
            style={[styles.loadingOverlay, { backgroundColor: colors.background }]}
            testID="map-loading"
          >
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading map…
            </Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
