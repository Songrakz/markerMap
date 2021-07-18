<template>
  <div class="map">
    <div id="dropdownlist" style="margin: auto; width: 250px">
      <v-select
        :items="localData"
        label="Select a region"
        item-text="region"
        item-value="value"
        v-model="selectdata"
        @change="selectData"
        style="z-index: 1"
      ></v-select>
    </div>
    <l-map
      :zoom="zoom"
      :center="center"
      @update:zoom="zoomUpdated"
      @update:center="centerUpdated"
      @update:bounds="boundsUpdated"
      ref="map"
      style="z-index: 0"
    >
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-control position="bottomright"
        ><v-card style="padding: 1rem" color="#CFD8DC">
          <h4 style="padding-bottom: 1em; text-align: center">scan range</h4>
          <i style="background: #f6f7d4">&emsp;</i
          ><span style="margin-left: 1em">{{this.datadeteil.scan_min}}-{{Math.round(this.levelColor.a20)}}</span><br />
          <i style="background: #d2f6c5">&emsp;</i
          ><span style="margin-left: 1em">{{Math.round(this.levelColor.a20)+1}}-{{Math.round(this.levelColor.a40)}}</span><br />
          <i style="background: #99f3bd">&emsp;</i
          ><span style="margin-left: 1em">{{Math.round(this.levelColor.a40)+1}}-{{Math.round(this.levelColor.a60)}}</span><br />
          <i style="background: #28df99">&emsp;</i
          ><span style="margin-left: 1em">{{Math.round(this.levelColor.a60)+1}}-{{Math.round(this.levelColor.a80)}}</span><br />
          <i style="background: #2ec1ac">&emsp;</i
          ><span style="margin-left: 1em">{{Math.round(this.levelColor.a80)+1}}-{{Math.round(this.datadeteil.scan_max)}}</span></v-card
        ></l-control
      >
      <!-- <l-polygon
        :lat-lngs="North.latlngs"
        :options="stlye"
        :fillOpacity="North.fillOpacity"
        @mouseover="setMouseOver_N"
        @mouseleave="setMouseLeave_N"
        ><l-tooltip>ภาคเหนือ</l-tooltip></l-polygon
      >
      <l-polygon
        :lat-lngs="Mid.latlngs"
        :options="stlye"
        :fillOpacity="Mid.fillOpacity"
        @mouseover="setMouseOver_M"
        @mouseleave="setMouseLeave_M"
        ><l-tooltip>ภาคกลาง</l-tooltip></l-polygon
      >
      <l-polygon
        :lat-lngs="Northeastern.latlngs"
        :options="stlye"
        :fillOpacity="Northeastern.fillOpacity"
        @mouseover="setMouseOver_Ne"
        @mouseleave="setMouseLeave_Ne"
        ><l-tooltip>ภาคตะวันออกเฉียงเหนือ</l-tooltip></l-polygon
      >
      <l-polygon
        :lat-lngs="West.latlngs"
        :options="stlye"
        :fillOpacity="West.fillOpacity"
        @mouseover="setMouseOver_W"
        @mouseleave="setMouseLeave_W"
        ><l-tooltip>ภาคตะวันตก</l-tooltip></l-polygon
      >
      <l-polygon
        :lat-lngs="East.latlngs"
        :options="stlye"
        :fillOpacity="East.fillOpacity"
        @mouseover="setMouseOver_E"
        @mouseleave="setMouseLeave_E"
        ><l-tooltip>ภาคตะวันออก</l-tooltip></l-polygon
      >
      <l-polygon
        :lat-lngs="South.latlngs"
        :options="stlye"
        :fillOpacity="South.fillOpacity"
        @mouseover="setMouseOver_S"
        @mouseleave="setMouseLeave_S"
        ><l-tooltip>ภาคใต้</l-tooltip></l-polygon
      > -->

      <l-marker
        @click="move_center(index)"
        v-for="(item, index) in datatmp"
        :key="index"
        :lat-lng="item.coordinates"
        :icon="getIcon(datatmp[index].scan_number)"
        ><l-tooltip>{{ item.name }}</l-tooltip></l-marker
      >
    </l-map>
  </div>
</template>

<script>
import { latLng } from "leaflet";
import L from "leaflet";
import {
  LMap,
  LTileLayer,
  //LPolygon,
  LTooltip,
  LMarker,
  LControl,
  //LIcon,
} from "vue2-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
//import { ReferenceChart } from 'vue-choropleth'

import { Icon } from "leaflet"; //marker แสดง

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
  name: "Leafmap",

  components: {
    LMap,
    LTileLayer,
    //LPolygon,
    LTooltip,
    LMarker,
    LControl,
    //ReferenceChart,
    //LIcon,
  },

  data() {
    return {
      zoom: 5.5,
      center: latLng(14.077861986151504, 100.60126469094739),
      url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',


      localData: [
        { value: "Thailand", region: "Thailand" },
        { value: "North", region: "North" },
        { value: "Northeastern", region: "Northeastern" },
        { value: "Central", region: "Central" },
        { value: "West", region: "West" },
        { value: "East", region: "East" },
        { value: "South", region: "South" },
      ],
      localField: { value: "Id", text: "region" },

      North: [],
      Mid: [],
      Northeastern: [],
      West: [],
      East: [],
      South: [],

      scan_coordi: [],
      scan_name: [],
      visible: false,

      datatmp: [],
      data_temp: [],
      selectdata: null,
      coordinates: [],
      scanmax: [],
      scanmin: [],
      dataHos: [],

      Split: ["#2ec1ac", "#28df99", "#99f3bd", "#d2f6c5", "#f6f7d4"],

      datadeteil: {
        region: "",
        scan_max: null,
        scan_min: null,
      },

      levelColor: {
        a20: null,
        a40: null,
        a60: null,
        a80: null,
        a100: null,
      },

      stlye: {
        color: "#20D516",
        fillOpacity: 0.08,
      },

      value_axios: null,
    };
  },

  methods: {
    setNewSelectedOption(selectedOption) {
      this.config.placeholder = selectedOption.value;
    },
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },
    boundsUpdated(bounds) {
      this.bounds = bounds;
    },
    move_center(index) {
      this.$refs.map.mapObject.flyTo(this.datatmp[index].coordinates, 10);
    },

    setMouseOver_N() {
      this.North.fillOpacity = this.fillOpacity[1];
    },
    setMouseLeave_N() {
      this.North.fillOpacity = this.fillOpacity[0];
    },
    setMouseOver_M() {
      this.Mid.fillOpacity = this.fillOpacity[1];
    },
    setMouseLeave_M() {
      this.Mid.fillOpacity = this.fillOpacity[0];
    },
    setMouseOver_Ne() {
      this.Northeastern.fillOpacity = this.fillOpacity[1];
    },
    setMouseLeave_Ne() {
      this.Northeastern.fillOpacity = this.fillOpacity[0];
    },
    setMouseOver_W() {
      this.West.fillOpacity = this.fillOpacity[1];
    },
    setMouseLeave_W() {
      this.West.fillOpacity = this.fillOpacity[0];
    },
    setMouseOver_E() {
      this.East.fillOpacity = this.fillOpacity[1];
    },
    setMouseLeave_E() {
      this.East.fillOpacity = this.fillOpacity[0];
    },
    setMouseOver_S() {
      this.South.fillOpacity = this.fillOpacity[1];
    },
    setMouseLeave_S() {
      this.South.fillOpacity = this.fillOpacity[0];
    },


    getIcon(showdata) {
      return L.divIcon({
        className: "my-custom-pin",
        html: `<svg width="40px" height="40px" viewBox="-5 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path id="Path_19" data-name="Path 19" d="M1002,44a10,10,0,0,0-10,10c0,5.523,10,20,10,20s10-14.477,10-20A10,10,0,0,0,1002,44Zm0,13a3,3,0,1,1,3-3A3,3,0,0,1,1002,57Z" transform="translate(-991 -43)" fill="${this.colors(
          showdata
        )}" stroke="#333" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
        </svg>`,
      });
    },

    colors(showdata) {

      var max = this.datadeteil.scan_max;
      var min = this.datadeteil.scan_min;
      this.levelColor.a100 = (max - min) + min;
      this.levelColor.a80 = (4 / 5) * (max - min) + min;
      this.levelColor.a60 = (3 / 5) * (max - min) + min;
      this.levelColor.a40 = (2 / 5) * (max - min) + min;
      this.levelColor.a20 = (1 / 5) * (max - min) + min;
      //console.log(this.datadeteil.scan_max);
      //console.log(this.datadeteil.scan_min);
      switch (true) {
        case showdata >= (4 / 5) * (max - min) + min &&
          showdata <= max - min + min:
          return this.Split[0];
        case showdata >= (3 / 5) * (max - min) + min &&
          showdata < (4 / 5) * (max - min) + min:
          return this.Split[1];
        case showdata >= (2 / 5) * (max - min) + min &&
          showdata < (3 / 5) * (max - min) + min:
          return this.Split[2];
        case showdata >= (1 / 5) * (max - min) + min &&
          showdata < (2 / 5) * (max - min) + min:
          return this.Split[3];
        case showdata >= (0 / 5) * (max - min) + min &&
          showdata < (1 / 5) * (max - min) + min:
          return this.Split[4];
      }
    },


    async getdata() {
      await axios
        .get(
          "https://raw.githubusercontent.com/Songrakz/vuemap/main/dataHospital.json"
        )
        .then((res) => {
          res.data.sort((a, b) => (a.scan_number < b.scan_number ? 1 : -1));
          this.datatmp = res.data;
          this.data_temp = this.datatmp;
        });
    },
    async selectData() {
      if (this.selectdata !== "Thailand") {
        this.datatmp = this.data_temp;
        this.dataHos = [];
        for (let index = 0; index < this.datatmp.length; index++) {
          if (this.datatmp[index].region === this.selectdata) {
            this.dataHos.push(this.datatmp[index]);
            this.coordinates.push(this.datatmp[index].coordinates);
          }
        }
        // this.dataHos.sort((a, b) => (a.scan_number < b.scan_number ? 1 : -1));
        this.datatmp = this.dataHos;
        this.datadeteil = {
          region: this.datatmp[0].region,
          scan_max: this.datatmp[0].scan_number,
          scan_min: this.datatmp[this.datatmp.length - 1].scan_number,
        };
        this.datadeteil = this.setDataDetail(this.datatmp,this.selectdata);
      } else {
        await this.getdata();
        this.datadeteil = this.setDataDetail(this.datatmp, this.selectdata);
      }
    },
    setDataDetail(data, select) {
      if (select === null) {
        return {
          region: "Thailand",
          scan_max: data[0].scan_number,
          scan_min: data[this.datatmp.length - 1].scan_number,
        }
      }
      return {
        region: select,
        scan_max: data[0].scan_number,
        scan_min: data[this.datatmp.length - 1].scan_number,
      }
    },
  },

  async created() {
    await this.getdata();
    this.datadeteil = this.setDataDetail(this.datatmp,this.selectdata);
  },
  mounted() {
    //var scan_sorted = [];

    axios
      .get(
        "https://raw.githubusercontent.com/narudolimudom/ThaiMap/main/Regions_Thailand_poly.json"
      )
      .then((result) => {
        this.value_axios = result.data;
        this.North = result.data[0];
        this.Mid = result.data[1];
        this.Northeastern = result.data[2];
        this.West = result.data[3];
        this.East = result.data[4];
        this.South = result.data[5];

      });
  },
};
</script>
 
<style scoped>
@import url(https://cdn.syncfusion.com/ej2/material.css);
.map {
  height: 95vh;
}
</style>