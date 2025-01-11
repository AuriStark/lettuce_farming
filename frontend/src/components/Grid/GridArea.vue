<template>
  <div class="svgContainer tw-pb-10" :style="{ transform: 'scale(' + scaleFactor + ')' }">
    <svg id="svgGridBack" ref="svgGridBack" class="map-background-svg tw-overflow-visible" :width="svgWidth + 100"
      :height="svgHeight + 100" @mousemove="handleMouseMove" @click="handleSvgClick" @mousedown="handleSvgMouseDown"
      @mouseup="stopInteraction">
      <g id="map-background">
        <defs>
          <pattern id="diagonalHatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M-1,1 l4,-4 M0,8 l8,-8 M7,9 l4,-4" stroke-width="0.5" stroke="rgba(0,0,0,0.07)"></path>
          </pattern>
        </defs>
        <rect id="bed-border" x="0" y="0" :width="svgWidth + 100" :height="svgHeight + 100" fill="#c39f7a"></rect>
        <rect id="bed-interior" x="10" y="10" :width="svgWidth + 80" :height="svgHeight + 80" stroke="rgba(120,63,4,0.25)"
          stroke-width="20" fill="#c39f7a"></rect>
        <rect id="no-access-perimeter" x="20" y="20" :width="svgWidth + 60" :height="svgHeight + 60"
          fill="url(#diagonalHatch)"></rect>
        <rect id="grid-fill" ref="svgGrid" class="tw-cursor-cell" x="50" y="50" :width="svgWidth" :height="svgHeight"
          fill="#ccaa88">
        </rect>
      </g>

      <svg class="coordinate-system tw-overflow-visible" x="50" y="50" :width="svgWidth" :height="svgHeight">
        <g class="drop-area-background">
          <g class="grid-lines">
            <!-- Grid lines -->
            <g v-for="x in gridX" :key="x">
              <line v-if="x % 100 === 0" :x1="x" y1="0" :x2="x" :y2="svgHeight" class="black-line" />
            </g>

            <g v-for="x in gridX" :key="x">
              <line v-if="x % 100 !== 0 && scaleFactor >= 0.6" :x1="x" y1="0" :x2="x" :y2="svgHeight" class="grid-line" />
            </g>

            <g v-for="y in gridY" :key="y">
              <line v-if="y % 100 === 0" x1="0" :y1="y" :x2="svgWidth" :y2="y" class="black-line" />
            </g>

            <g v-for="y in gridY" :key="y">
              <line v-if="y % 100 !== 0 && scaleFactor >= 0.6" x1="0" :y1="y" :x2="svgWidth" :y2="y" class="grid-line" />
            </g>
          </g>

          <g id="farmbot-layer" style="pointer-events: none">
            <g id="extents" :stroke-width="3 / scaleFactor" stroke-linecap="square" stroke="rgba(0, 0, 0, 0.2)"
              stroke-dasharray="12">
              <g id="home-lines">
                <line x1="2" :y1="svgHeight - 2" x2="2" :y2="svgHeight - safeZoneHeighth"></line>
                <line x1="2" :y1="svgHeight - 2" :x2="safeZoneWidth" :y2="svgHeight - 2"></line>
              </g>
              <g id="max-lines">
                <line :x1="safeZoneWidth" :y1="svgHeight - 2" :x2="safeZoneWidth" :y2="svgHeight - safeZoneHeighth">
                </line>
                <line x1="2" :y1="svgHeight - safeZoneHeighth" :x2="safeZoneWidth" :y2="svgHeight - safeZoneHeighth">
                </line>
              </g>
            </g>
          </g>
        </g>

        <g v-if="allowedField" id="zone-area">
          <defs>
            <pattern id="pattern-5" patternUnits="userSpaceOnUse" width="6" height="6">
              <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke="#66BB6A" />
            </pattern>
          </defs>
          <rect id="allowed-perimeter" :x="allowedField.x" :y="getY(allowedField.y) - allowedField.height"
            :width="allowedField.width" :height="allowedField.height" fill="url(#pattern-5)" stroke="#1B5E20"
            stroke-width="5" stroke-opacity="0.5">
          </rect>
        </g>

        <Plant v-if="showPlants" v-for="(seed, index) in seedsList" :key="index" :cropType="seed.cropType" :xPos="seed.position.x"
          :yPos="getY(seed.position.y)" :humidity="seed.humidityValue" :showMoisture="showMoisture"></Plant>


        <!-- Cursor position display -->
        <text v-if="showCursor" :x="cursorX + 20" :y="cursorY - 20" class="cursor-coordinates"
          :style="{ fontSize: 15 / scaleFactor }">
          {{ cursorCoordinates }}
        </text>

        <Plant v-for="(seed, index) in temporalSeeds" :key="index" :cropType="seed.cropType" :xPos="seed.x"
          :yPos="getY(seed.y)" :temporal="true"></Plant>

        <g id="motor-position" v-if="showFarmbot">
          <rect id="gantry" :x="botPositionX - 10" y="0" width="20" :height="svgHeight" fill-opacity="0.5" fill="#434343">
          </rect>
          <g id="UTM-wrapper" fill-opacity="0.5" fill="#434343" style="pointer-events: all">
            <defs>
              <radialGradient id="SeederGradient">
                <stop offset="5%" stop-color="#000000" stop-opacity="0.25"></stop>
                <stop offset="95%" stop-color="#000000" stop-opacity="0.15"></stop>
              </radialGradient>
            </defs>

            <circle id="UTM" :cx="botPositionX" :cy="botPositionY" r="35" fill-opacity="0.5" :fill="currentToolTipColor">
            </circle>
            <circle :cx="botPositionX" :cy="botPositionY" r="30" fill="url(#SeederGradient)"></circle>
          </g>
        </g>

        <g id="target-coordinate" v-if="showCursor">
          <defs>
            <g id="target-coordinate-crosshair-segment">
              <rect :x="highlightPosition.x - 28" :y="highlightPosition.y - 5.6" width="28" height="11.2" fill="#434343">
              </rect>
            </g>
          </defs>
          <g id="long-crosshair">
            <rect :x="highlightPosition.x - 0.5" y="0" width="1" :height="svgHeight"></rect>
            <rect x="0" :y="highlightPosition.y - 0.5" :width="svgWidth" height="1"></rect>
          </g>
          <use stroke="#ffffff" stroke-width="2" xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(0, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use stroke="#ffffff" stroke-width="2" xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(90, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use stroke="#ffffff" stroke-width="2" xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(180, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use stroke="#ffffff" stroke-width="2" xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(270, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(0, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(90, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(180, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <use xlink:href="#target-coordinate-crosshair-segment" :transform="'rotate(270, ' +
            highlightPosition.x +
            ',' +
            highlightPosition.y +
            ')'
            "></use>
          <g id="no-target-line"></g>

          <g id="x-label" opacity="0.9" :style="{
            transformOrigin: 'center bottom',
            transformBox: 'fill-box',
            transform: 'translate(0px, -15px) scale(' + 1 / scaleFactor + ')',
            transition: 'transform 0.2s ease 0s',
          }">
            <path fill="#434343" :d="'M' +
              (-15 + highlightPosition.x) +
              ',' + (svgHeight - 5) + ' h28 a4,4 0 0 1 4,4 v10 a4,4 0 0 1 -4,4 h-14 h-14 a4,4 0 0 1 -4,-4 v-10 a4,4 0 0 1 4,-4 z'
              "></path>
            <text font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="central" fill="#ffffff"
              font-weight="bold" :x="highlightPosition.x" :y="svgHeight + 9 - 5">
              {{ highlightPosition.x }}
            </text>
          </g>

          <g id="y-label" opacity="0.9" :style="{
            transformOrigin: 'center top',
            transformBox: 'fill-box',
            transform:
              'translate(-5px, -50%) rotate(-90deg) scale(' +
              1 / scaleFactor +
              ')',
            transition: 'transform 0.2s ease 0s',
          }">
            <path fill="#434343" :d="'M-14,' +
              (highlightPosition.y - 9) +
              ' h28 a4,4 0 0 1 4,4 v10 a4,4 0 0 1 -4,4 h-14 h-14 a4,4 0 0 1 -4,-4 v-10 a4,4 0 0 1 4,-4 z'
              "></path>
            <text font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="central" fill="#ffffff"
              font-weight="bold" :x="2" :y="highlightPosition.y">
              {{ getY(highlightPosition.y) }}
            </text>
          </g>
        </g>

        <g id="toolslot-layer" style="cursor: pointer;">
          <g id="toolslot-1035349">
            <g id="toolbay-slot">
              <defs id="unrotated-tool-slot-source">
                <g id="toolbay-slot-1035349" fill-opacity="0.25" fill="#666666">
                  <path
                    d="M2675 1105 h -150 v -100 h 150 v 15.5 a 5 5 0 0 1 -2.5 2.5 h -61.5 a 35 35 0 0 0 0 64 h 61.5 a 5 5 0 0 1 2.5 2.5 z">
                  </path>
                </g>
              </defs>
              <use xlink:href="#toolbay-slot-1035349" transform="rotate(180, 2625, 1055)" style="pointer-events: none;">
              </use>
            </g>
            <g id="rotated-tool-Point.1035349.125" v-if="currentTooltip != 'watering'">
              <defs id="unrotated-tool-source">
                <g id="unrotated-tool-Point.1035349.125">
                  <g id="watering-nozzle">
                    <defs id="watering-nozzle-patterns">
                      <pattern id="WateringNozzlePattern1-Point.1035349.125" patternUnits="userSpaceOnUse" x="2623"
                        y="1053" width="14" height="10">
                        <circle cx="2" cy="2" r="2" fill="#000000" fill-opacity="0.4"></circle>
                      </pattern>
                      <pattern id="WateringNozzlePattern2-Point.1035349.125" patternUnits="userSpaceOnUse" x="2616"
                        y="1048" width="14" height="10">
                        <circle cx="2" cy="2" r="2" fill="#000000" fill-opacity="0.4"></circle>
                      </pattern>
                      <pattern id="WateringNozzlePattern3-Point.1035349.125" patternUnits="userSpaceOnUse" x="2625"
                        y="1055" width="42" height="10">
                        <circle cx="21" cy="5" r="2" fill="#000000" fill-opacity="0.4"></circle>
                      </pattern>
                    </defs>
                    <circle cx="2625" cy="1055" r="35" fill="rgba(40, 120, 220)" fill-opacity="0.8"></circle>
                    <circle cx="2625" cy="1055" r="30" fill="#000000" fill-opacity="0.2"></circle>
                    <rect x="2609" y="1033" width="32" height="44" fill="url(#WateringNozzlePattern1-Point.1035349.125)">
                    </rect>
                    <rect x="2616" y="1038" width="18" height="34" fill="url(#WateringNozzlePattern2-Point.1035349.125)">
                    </rect>
                    <rect x="2602" y="1048" width="46" height="14" fill="url(#WateringNozzlePattern3-Point.1035349.125)">
                    </rect>
                  </g>
                </g>
              </defs>
              <use xlink:href="#unrotated-tool-Point.1035349.125" transform="rotate(90, 2625, 1055)"></use>
            </g><text text-anchor="end" visibility="hidden" x="2625" y="1055" dx="-40" dy="10" font-size="24"
              fill="#434343">Watering Nozzle</text>
          </g>


          <g id="toolslot-1035464">
            <g id="toolbay-slot">
              <defs id="unrotated-tool-slot-source">
                <g id="toolbay-slot-1035464" fill-opacity="0.25" fill="#666666">
                  <path
                    d="M2675 1000 h -150 v -100 h 150 v 15.5 a 5 5 0 0 1 -2.5 2.5 h -61.5 a 35 35 0 0 0 0 64 h 61.5 a 5 5 0 0 1 2.5 2.5 z">
                  </path>
                </g>
              </defs>
              <use xlink:href="#toolbay-slot-1035464" transform="rotate(180, 2625, 950)" style="pointer-events: none;">
              </use>
            </g>
            <g id="rotated-tool-Point.1035464.123" v-if="currentTooltip != 'seeding'">
              <defs id="unrotated-tool-source">
                <g id="unrotated-tool-Point.1035464.123">
                  <g id="seeder">
                    <defs id="seeder-gradient">
                      <radialGradient id="SeederGradient">
                        <stop offset="5%" stop-color="#000000" stop-opacity="0.25"></stop>
                        <stop offset="95%" stop-color="#000000" stop-opacity="0.15"></stop>
                      </radialGradient>
                    </defs>
                    <circle cx="2625" cy="950" r="35" fill="rgba(240, 200, 0)" fill-opacity="0.7"></circle>
                    <circle cx="2625" cy="950" r="30" fill="url(#SeederGradient)"></circle>
                    <circle cx="2625" cy="967.5" r="5.5" fill="#000000" fill-opacity="0.25"></circle>
                    <circle cx="2625" cy="967.5" r="2" fill="#000000" fill-opacity="0.3"></circle>
                  </g>
                </g>
              </defs>

              <g id="selected-tool-slot-indicator">
                <circle class="tw-origin-center animate animate__animated animate__pulse animate__infinite"
                  style="transform-box: fill-box;" cx="2625" cy="950" r="40" stroke="#ffffff" stroke-opacity="0.7"
                  stroke-width="2" stroke-dasharray="5" fill="#ffffff" fill-opacity="0.25"></circle>
              </g>
              <use xlink:href="#unrotated-tool-Point.1035464.123" transform="rotate(270, 2625, 950)"></use>
            </g><text text-anchor="end" visibility="hidden" x="2625" y="950" dx="-40" dy="10" font-size="24"
              fill="#434343">Seeder</text>
          </g>


          <g id="toolslot-1035465">
            <g id="toolbay-slot">
              <defs id="unrotated-tool-slot-source">
                <g id="toolbay-slot-1035465" fill-opacity="0.25" fill="#666666">
                  <path
                    d="M2675 905 h -150 v -100 h 150 v 15.5 a 5 5 0 0 1 -2.5 2.5 h -61.5 a 35 35 0 0 0 0 64 h 61.5 a 5 5 0 0 1 2.5 2.5 z">
                  </path>
                </g>
              </defs>
              <use xlink:href="#toolbay-slot-1035465" transform="rotate(180, 2625, 855)" style="pointer-events: none;">
              </use>
            </g>
            <g id="rotated-tool-Point.1035465.124" v-if="currentTooltip != 'moisture'">
              <defs id="unrotated-tool-source">
                <g id="unrotated-tool-Point.1035465.124">
                  <g id="soil-sensor">
                    <defs id="soil-sensor-gradient-and-pattern">
                      <radialGradient id="SoilSensorGradient">
                        <stop offset="5%" stop-color="#000000" stop-opacity="0.4"></stop>
                        <stop offset="95%" stop-color="#000000" stop-opacity="0.2"></stop>
                      </radialGradient>
                      <pattern id="SoilSensorPattern" x="0" y="2" width="0.6666666666666666" height="1">
                        <rect x="0" y="0" width="8" height="1" fill="rgba(255, 215, 0)" fill-opacity="0.9"></rect>
                        <rect x="0" y="1" width="8" height="2" fill="#000000" fill-opacity="0.8"></rect>
                        <rect x="0" y="3" width="8" height="1" fill="rgba(255, 215, 0)" fill-opacity="0.9"></rect>
                      </pattern>
                    </defs>
                    <circle cx="2625" cy="855" r="35" fill="rgba(128, 128, 128)" fill-opacity="0.8"></circle>
                    <circle cx="2625" cy="855" r="30" fill="url(#SoilSensorGradient)"></circle>
                    <rect x="2613" y="855" width="24" height="4" fill="#000000" fill-opacity="0.4"></rect>
                    <rect x="2613" y="855" width="24" height="4" fill="url(#SoilSensorPattern)"></rect>
                  </g>
                </g>
              </defs>
              <use xlink:href="#unrotated-tool-Point.1035465.124" transform="rotate(90, 2625, 855)"></use>
            </g><text text-anchor="end" visibility="hidden" x="2625" y="855" dx="-40" dy="10" font-size="24"
              fill="#434343">Soil Sensor</text>
          </g>
        </g>

        <g v-if="createArea && displayCreateJob" id="zone-area" class="tw-z-10">
          <defs>
            <pattern id="diagonalHatch2" patternUnits="userSpaceOnUse" width="4" height="20"
              patternTransform="rotate(-45 2 2)">
              <path d="M -1,2 l 6,0" stroke="#000000" stroke-width="5" stroke-opacity="0.5" />
            </pattern>
          </defs>
          <rect id="no-access-perimeter" class="!tw-cursor-grab" :x="createArea.x"
            :y="getY(createArea.y) - createArea.height" :width="createArea.width" :height="createArea.height"
            fill="url(#diagonalHatch2)" stroke="#000000" stroke-width="5" stroke-opacity="0.5" @mousedown="startDrag"
            @click.stop></rect>

          <circle id="top-left" class="!tw-cursor-nesw-resize" :cx="createArea.x" :cy="getY(createArea.y)"
            :r="10 / scaleFactor" fill="white" @mousedown.stop="startResize(0, $event)" @click.stop />
          <circle id="top-right" class="!tw-cursor-nwse-resize" :cx="createArea.x + createArea.width"
            :cy="getY(createArea.y)" :r="10 / scaleFactor" fill="white" @mousedown.stop="startResize(1, $event)"
            @click.stop />
          <circle id="bottom-left" class="!tw-cursor-nwse-resize" :cx="createArea.x"
            :cy="getY(createArea.y + createArea.height)" :r="10 / scaleFactor" fill="white"
            @mousedown.stop="startResize(2, $event)" @click.stop />
          <circle id="bottom-right" class="!tw-cursor-nesw-resize" :cx="createArea.x + createArea.width"
            :cy="getY(createArea.y + createArea.height)" :r="10 / scaleFactor" fill="white"
            @mousedown.stop="startResize(3, $event)" @click.stop />
        </g>

        <g v-if="hoverArea" id="zone-area" class="tw-z-10">
          <defs>
            <pattern id="diagonalHatch2" patternUnits="userSpaceOnUse" width="4" height="20"
              patternTransform="rotate(-45 2 2)">
              <path d="M -1,2 l 6,0" stroke="#000000" stroke-width="5" stroke-opacity="0.5" />
            </pattern>
          </defs>
          <rect id="hoverArea" :x="hoverArea.x" :y="getY(hoverArea.y) - hoverArea.height" :width="hoverArea.width"
            :height="hoverArea.height" fill="url(#diagonalHatch2)" stroke="#000000" stroke-width="5" stroke-opacity="0.5">
          </rect>
        </g>
      </svg>


      <g id="origin-marker" :style="{
        transformOrigin: 'bottom',
        transformBox: 'fill-box',
        transform: 'scale(' + 1 / scaleFactor + ')',
        transition: 'transform 0.2s ease 0s',
      }">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="2" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,4 L5,2 z" fill="#434343"></path>
          </marker>
        </defs>
        <circle :cx="50 + (1 - scaleFactor) * 20" :cy="svgHeight + 50 + (1 - scaleFactor) * 20" r="4" fill="#434343">
        </circle>
        <g id="axis-labels" font-family="Arial" font-size="14" fill="#434343" text-anchor="middle"
          dominant-baseline="central" font-weight="bold">
          <text :x="75 + (1 - scaleFactor) * 20" :y="svgHeight + 40 + (1 - scaleFactor) * 20">
            X
          </text>
          <text :x="40 + (1 - scaleFactor) * 20" :y="svgHeight + 25 + (1 - scaleFactor) * 20">
            Y
          </text>
        </g>
        <g id="axis-arrows" stroke="#434343" stroke-width="3" marker-end="url(#arrow)">
          <line :x1="50 + (1 - scaleFactor) * 20" :y1="svgHeight + 50 + (1 - scaleFactor) * 20" x2="100"
            :y2="svgHeight + 50 + (1 - scaleFactor) * 20"></line>
          <line :x1="50 + (1 - scaleFactor) * 20" :y1="svgHeight + 50 + (1 - scaleFactor) * 20"
            :x2="50 + (1 - scaleFactor) * 20" :y2="svgHeight"></line>
        </g>
      </g>

      <g id="axis-values">
        <template v-for="x in gridX" :key="x">
          <g v-if="x %
            (scaleFactor >= 0.6 ? 100 : scaleFactor <= 0.2 ? 500 : 200) ===
            0 && x !== 0
            " id="x-label" opacity="0.9" :style="{
    transformOrigin: 'center top',
    transformBox: 'fill-box',
    transform: 'translate(0px, -15px) scale(' + 1 / scaleFactor + ')',
    transition: 'transform 0.2s ease 0s',
  }">
            <g id="label">
              <path fill="#8d7157" :d="'M' +
                (50 - 14 + x) +
                ',' +
                (svgHeight + 70) +
                ' h28 a4,4 0 0 1 4,4 v10 a4,4 0 0 1 -4,4 h-14 h-14 a4,4 0 0 1 -4,-4 v-10 a4,4 0 0 1 4,-4 z'
                "></path>
              <text font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="central" fill="#ffffff"
                font-weight="bold" :x="50 + x" :y="svgHeight + 80">
                {{ x }}
              </text>
            </g>
          </g>
        </template>

        <template v-for="y in gridY" :key="y">
          <g v-if="y %
            (scaleFactor >= 0.6 ? 100 : scaleFactor <= 0.2 ? 500 : 200) ===
            0 && y !== 0
            " id="y-label" opacity="0.9" :style="{
    transformOrigin: 'center bottom',
    transformBox: 'fill-box',
    transform:
      'translate(-5px, -50%) rotate(-90deg) scale(' +
      1 / scaleFactor +
      ')',
    transition: 'transform 0.2s ease 0s',
  }">
            <g id="label">
              <path fill="#8d7157" :d="'M36,' +
                (svgHeight - y + 41) +
                ' h28 a4,4 0 0 1 4,4 v10 a4,4 0 0 1 -4,4 h-14 h-14 a4,4 0 0 1 -4,-4 v-10 a4,4 0 0 1 4,-4 z'
                "></path>
              <text font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="central" fill="#ffffff"
                font-weight="bold" :x="50" :y="svgHeight + 50 - y">
                {{ y }}
              </text>
            </g>
          </g>
        </template>
      </g>
    </svg>
  </div>
</template>

<script>
import { getListOfSeeds } from "@/js/api";

import Plant from "./Plant.vue";

export default {
  components: {
    Plant
  },

  props: {
    scaleFactor: {
      type: Number,
      default: 1,
    },
    showPlants: {
      type: Boolean,
      default: true,
    },
    showMoisture: {
      type: Boolean,
      default: false,
    },
    showFarmbot: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      svgWidth: 2694,
      svgHeight: 1200,

      gridX: [],
      gridY: [],
      showCursor: false,
      cursorX: 0,
      cursorY: 0,
      cursorCoordinates: "",

      position: { x: 0, y: 0 },
      highlightPosition: { x: 0, y: 0 },


      // Datas for drag and drop
      isDragging: false,
      isResizing: false,
      resizeIndex: null,
      initialMouseX: 0,
      initialMouseY: 0,
      initialX: 0,
      initialY: 0,
      initialW: 0,
      initialH: 0,
    };
  },

  computed: {
    safeZoneWidth() {
      return 2694.8;
    },

    safeZoneHeighth() {
      return 1200;
    },

    createArea() {
      return this.$store.state.createArea;
    },

    hoverArea() {
      return this.$store.state.hoverArea;
    },

    temporalSeeds() {
      return this.$store.state.temporalSeeds;
    },

    allowedField() {
      return this.$store.state.userDatas?.allowedField;
    },

    botPosition() {
      return this.$store.state.botPosition;
    },

    botPositionX() {
      return this.botPosition?.x ?? 0;
    },

    botPositionY() {
      return this.getY(this.botPosition?.y ?? 0);
    },

    seedsList() {
      return this.$store.state.seedsList;
    },

    displayCreateJob() {
      return this.$store.state.createNewJobVisible;
    },

    currentTooltip() {
      return this.$store.state.currentTooltip;
    },

    currentToolTipColor() {
      switch (this.currentTooltip) {
        case 'seeding':
          return "#f0c800"
          break
        case 'watering':
          return "#2878dc"
          break
        case 'moisture':
          return '#808080'
          break
      }

      return "#434343"
    }
  },

  methods: {
    calculateGrid() {
      const gridXCount = this.svgWidth / 10;
      const gridYCount = this.svgHeight / 10;
      this.gridX = Array.from({ length: gridXCount + 1 }, (_, i) => i * 10);
      this.gridY = Array.from({ length: gridYCount + 1 }, (_, i) => i * 10);
    },

    handleMouseMove(event) {
      const rect = this.$refs.svgGrid.getBoundingClientRect();

      let caliberX = (rect.width / this.scaleFactor - this.svgWidth) / 2;
      let caliberY = (rect.height / this.scaleFactor - this.svgHeight) / 2;

      let cursorX = ((event.clientX - rect.left) / this.scaleFactor);
      let cursorY = ((event.clientY - rect.top) / this.scaleFactor);

      this.cursorX = (cursorX < 0 ? 0 : (cursorX > this.svgWidth ? this.svgWidth : cursorX))
      this.cursorY = (cursorY < 0 ? 0 : (cursorY > this.svgHeight ? this.svgHeight : cursorY))

      let coordinateX = Math.round(this.cursorX);
      let coordinateY = Math.round(this.cursorY);

      this.position = { x: coordinateX, y: coordinateY };
      this.cursorCoordinates = `${coordinateX}, ${this.getY(coordinateY)}`;

      if (this.isDragging) {
        this.handleDrag(event)
      } else if (this.isResizing) {
        this.handleResize(event)
      }
    },

    handleSvgClick(event) {
      if (this.isDragging) {
        this.startDrag()
        return
      };

      if (this.isResizing) {
        this.stopResize()
        return
      };

      this.showCursor = true;

      this.highlightPosition = { x: this.position.x, y: this.position.y };

      this.setCoordinates();
    },

    setCoordinates() {
      this.$store.commit("setCoordinates", {
        x: this.highlightPosition.x,
        y: this.getY(this.highlightPosition.y),
      });

      this.$store.commit("setCreateArea", {
        x: this.highlightPosition.x,
        y: this.getY(this.highlightPosition.y),
        width: this.createArea?.width,
        height: this.createArea?.height,
      });
    },

    getY(y) {
      return this.svgHeight - y;
    },

    // Funtions for drag and drop
    startDrag(event) {
      this.isDragging = true;
      this.initialMouseX = event.clientX;
      this.initialMouseY = event.clientY;
      this.initialX = this.createArea.x;
      this.initialY = this.createArea.y;
    },

    handleDrag(event) {
      if (!this.isDragging) return;
      const dx = (event.clientX - this.initialMouseX) / this.scaleFactor;
      const dy = (event.clientY - this.initialMouseY) / this.scaleFactor;

      this.updateCreateArea({ x: this.initialX + dx, y: this.initialY - dy })
    },

    stopDrag() {
      this.isDragging = false;
    },

    startResize(index, event) {
      this.isResizing = true;
      this.resizeIndex = index;

      this.initialMouseX = event.clientX;
      this.initialMouseY = event.clientY;

      this.initialX = this.createArea.x;
      this.initialY = this.createArea.y;
      this.initialW = this.createArea.width;
      this.initialH = this.createArea.height;
    },

    handleResize(event) {
      if (!this.isResizing) return;

      const dx = (event.clientX - this.initialMouseX) / this.scaleFactor;
      const dy = (event.clientY - this.initialMouseY) / this.scaleFactor;

      let newArea = {}

      if (this.resizeIndex === 0) {
        newArea.x = this.initialX + dx;
        newArea.y = this.initialY - dy;
        newArea.width = this.initialW - dx;
        newArea.height = this.initialH + dy;
      } else if (this.resizeIndex === 1) {
        newArea.width = this.initialW + dx;
        newArea.y = this.initialY - dy;
        newArea.height = this.initialH + dy;
      } else if (this.resizeIndex === 2) {
        newArea.x = this.initialX + dx;
        newArea.width = this.initialW - dx;
        newArea.height = this.initialH - dy;
      } else if (this.resizeIndex === 3) {
        newArea.width = this.initialW + dx;
        newArea.height = this.initialH - dy;
      }

      this.updateCreateArea(newArea)
    },

    stopResize() {
      this.isResizing = false;
      this.resizeIndex = null;
    },

    handleMouseDown(event) {
      if (this.isDragging || this.isResizing) {
        event.stopPropagation();
      }
    },

    stopInteraction() {
      this.isDragging = false;
      this.isResizing = false;
      this.resizeIndex = null;
    },

    updateCreateArea(area) {
      const { x, y, width, height } = area;

      let newArea = { ...this.createArea }

      if (x) newArea.x = parseInt(x)
      if (y) newArea.y = parseInt(y)
      if (width) newArea.width = parseInt(width)
      if (height) newArea.height = parseInt(height)

      this.$store.commit("setCreateArea", newArea)
    }
  },

  mounted() {
    this.calculateGrid();

    getListOfSeeds()
      .then((response) => {
        this.$store.commit("setSeedsList", response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<style scoped lang="scss">
.grid-line {
  stroke: #5c5c5c85;
  stroke-width: 1;
}

.black-line {
  stroke: #000;
  stroke-width: 1;
}

.axis-label {
  z-index: 2;
  font-size: 12px;
  fill: #333;
}

.cursor-coordinates {
  font-size: 14px;
  fill: #333;
  font-weight: bold;
}

.highlight-symbol {
  font-size: 20px;
  fill: red;
  font-weight: bold;
}

.svgContainer {
  transform-origin: 0 0;
}

.area-rectangle {
  stroke: purple;
  fill: none;
  stroke-width: 2;
}

.coordinate-system {
  cursor: cell;

  * {
    cursor: cell;
  }
}
</style>
