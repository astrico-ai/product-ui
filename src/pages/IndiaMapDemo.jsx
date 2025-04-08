import React from "react";
import { MainLayout } from "@/components/MainLayout";
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip } from "react-tooltip";

// Helper functions
export const findDistrictByCode = (code) => {
  // Try exact match first
  let district = districtData.find(d => d.id === code);
  
  // If no match, try padding with zeros
  if (!district && code) {
    const paddedCode = code.padStart(3, '0');
    district = districtData.find(d => d.id === paddedCode);
  }
  
  return district;
};

// Updated sample data with district codes
export const districtData = [
  // Maharashtra Districts
  { id: "519", district: "Mumbai", state: "Maharashtra", value: 48500 },
  { id: "520", district: "Pune", state: "Maharashtra", value: 45200 },
  { id: "521", district: "Nagpur", state: "Maharashtra", value: 32800 },
  { id: "522", district: "Thane", state: "Maharashtra", value: 41500 },
  { id: "523", district: "Nashik", state: "Maharashtra", value: 28900 },
  { id: "524", district: "Aurangabad", state: "Maharashtra", value: 25600 },
  { id: "525", district: "Solapur", state: "Maharashtra", value: 22400 },
  { id: "526", district: "Kolhapur", state: "Maharashtra", value: 27800 },
  { id: "527", district: "Ahmednagar", state: "Maharashtra", value: 24300 },
  { id: "528", district: "Amravati", state: "Maharashtra", value: 19800 },
  { id: "529", district: "Sangli", state: "Maharashtra", value: 21500 },
  { id: "530", district: "Satara", state: "Maharashtra", value: 23600 },
  { id: "531", district: "Chandrapur", state: "Maharashtra", value: 18900 },
  { id: "532", district: "Dhule", state: "Maharashtra", value: 17500 },
  { id: "533", district: "Jalgaon", state: "Maharashtra", value: 26400 },
  { id: "534", district: "Parbhani", state: "Maharashtra", value: 15800 },
  { id: "535", district: "Yavatmal", state: "Maharashtra", value: 16900 },
  { id: "536", district: "Latur", state: "Maharashtra", value: 19200 },
  { id: "537", district: "Akola", state: "Maharashtra", value: 17800 },
  { id: "538", district: "Nanded", state: "Maharashtra", value: 20500 },

  // Gujarat Districts
  { id: "474", district: "Ahmedabad", state: "Gujarat", value: 47800 },
  { id: "475", district: "Surat", state: "Gujarat", value: 44600 },
  { id: "476", district: "Vadodara", state: "Gujarat", value: 38900 },
  { id: "477", district: "Rajkot", state: "Gujarat", value: 35200 },
  { id: "478", district: "Bhavnagar", state: "Gujarat", value: 28700 },
  { id: "479", district: "Jamnagar", state: "Gujarat", value: 26500 },
  { id: "480", district: "Gandhinagar", state: "Gujarat", value: 31200 },
  { id: "481", district: "Junagadh", state: "Gujarat", value: 24800 },
  { id: "482", district: "Kutch", state: "Gujarat", value: 29500 },
  { id: "483", district: "Anand", state: "Gujarat", value: 22900 },
  { id: "484", district: "Bharuch", state: "Gujarat", value: 27300 },
  { id: "485", district: "Mehsana", state: "Gujarat", value: 25100 },
  { id: "486", district: "Patan", state: "Gujarat", value: 19600 },
  { id: "487", district: "Amreli", state: "Gujarat", value: 18400 },
  { id: "488", district: "Valsad", state: "Gujarat", value: 23700 },
  { id: "489", district: "Kheda", state: "Gujarat", value: 21800 },
  { id: "490", district: "Porbandar", state: "Gujarat", value: 17900 },
  { id: "491", district: "Navsari", state: "Gujarat", value: 22400 },
  { id: "492", district: "Morbi", state: "Gujarat", value: 20800 },
  { id: "493", district: "Sabarkantha", state: "Gujarat", value: 19300 },

  // Karnataka Districts
  { id: "575", district: "Bangalore", state: "Karnataka", value: 42300 },
  { id: "576", district: "Mysore", state: "Karnataka", value: 31200 },
  { id: "577", district: "Hubli-Dharwad", state: "Karnataka", value: 28400 },
  { id: "578", district: "Mangalore", state: "Karnataka", value: 26700 },
  { id: "579", district: "Belgaum", state: "Karnataka", value: 23500 },

  // Tamil Nadu Districts
  { id: "557", district: "Chennai", state: "Tamil Nadu", value: 41800 },
  { id: "558", district: "Coimbatore", state: "Tamil Nadu", value: 35600 },
  { id: "559", district: "Madurai", state: "Tamil Nadu", value: 29400 },
  { id: "560", district: "Salem", state: "Tamil Nadu", value: 24800 },
  { id: "561", district: "Tiruchirappalli", state: "Tamil Nadu", value: 22900 },

  // Kerala Districts
  { id: "595", district: "Thiruvananthapuram", state: "Kerala", value: 32400 },
  { id: "596", district: "Kochi", state: "Kerala", value: 35800 },
  { id: "597", district: "Kozhikode", state: "Kerala", value: 28900 },
  { id: "598", district: "Thrissur", state: "Kerala", value: 26500 },

  // Telangana Districts
  { id: "532", district: "Hyderabad", state: "Telangana", value: 39800 },
  { id: "533", district: "Warangal", state: "Telangana", value: 25600 },
  { id: "534", district: "Karimnagar", state: "Telangana", value: 22400 },

  // Andhra Pradesh Districts
  { id: "545", district: "Visakhapatnam", state: "Andhra Pradesh", value: 34500 },
  { id: "546", district: "Vijayawada", state: "Andhra Pradesh", value: 29800 },
  { id: "547", district: "Guntur", state: "Andhra Pradesh", value: 24600 },

  // Delhi Districts
  { id: "101", district: "New Delhi", state: "Delhi", value: 45600 },
  { id: "102", district: "South Delhi", state: "Delhi", value: 42300 },
  { id: "103", district: "East Delhi", state: "Delhi", value: 38900 },

  // Punjab Districts
  { id: "049", district: "Ludhiana", state: "Punjab", value: 31200 },
  { id: "050", district: "Amritsar", state: "Punjab", value: 28900 },
  { id: "051", district: "Jalandhar", state: "Punjab", value: 26400 },

  // Rajasthan Districts
  { id: "120", district: "Jaipur", state: "Rajasthan", value: 33600 },
  { id: "121", district: "Jodhpur", state: "Rajasthan", value: 27800 },
  { id: "122", district: "Udaipur", state: "Rajasthan", value: 24500 },

  // West Bengal Districts
  { id: "338", district: "Kolkata", state: "West Bengal", value: 38900 },
  { id: "339", district: "Howrah", state: "West Bengal", value: 29400 },
  { id: "340", district: "North 24 Parganas", state: "West Bengal", value: 26800 },

  // Uttar Pradesh Districts
  { id: "150", district: "Lucknow", state: "Uttar Pradesh", value: 32400 },
  { id: "151", district: "Kanpur", state: "Uttar Pradesh", value: 28900 },
  { id: "152", district: "Varanasi", state: "Uttar Pradesh", value: 25600 },
  { id: "153", district: "Agra", state: "Uttar Pradesh", value: 23400 },

  // Madhya Pradesh Districts
  { id: "200", district: "Bhopal", state: "Madhya Pradesh", value: 29800 },
  { id: "201", district: "Indore", state: "Madhya Pradesh", value: 31200 },
  { id: "202", district: "Jabalpur", state: "Madhya Pradesh", value: 24500 }
];

export const INDIA_TOPO_JSON = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@dc5d493/topojson/india.json";

export const COLOR_RANGE = [
  "#ffedea",
  "#ffcec5",
  "#ffad9f",
  "#ff8a75",
  "#ff5533",
  "#e2492d",
  "#be3d26",
  "#9a311f",
  "#782618"
];

const IndiaMapDemo = () => {
  const [tooltipContent, setTooltipContent] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState(null);

  const colorScale = scaleQuantile()
    .domain(districtData.map(d => d.value))
    .range(COLOR_RANGE);

  const getData = (districtCode) => {
    const data = districtData.find(item => item.id === districtCode);
    return data ? data.value : 0;
  };

  const getDistrictData = (districtCode) => {
    return districtData.find(item => item.id === districtCode);
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(value);
  };

  const renderLegend = () => {
    const legendData = colorScale.range().map((color, i) => {
      const domain = colorScale.invertExtent(color);
      return {
        color: color,
        min: domain[0],
        max: domain[1]
      };
    });

    return (
      <div className="flex flex-col gap-1 absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md border border-gray-200">
        <div className="text-xs font-medium text-gray-700">Insurance Sales</div>
        {legendData.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="text-[10px] text-gray-600">
              {item.min ? formatValue(Math.round(item.min)) : '0'} 
              {item.max ? ` - ${formatValue(Math.round(item.max))}` : '+'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">District-wise Insurance Sales</h3>
              <p className="text-sm text-gray-500 mt-1">Click on a district to view detailed information</p>
            </div>
            {selectedDistrict && (
              <div className="text-sm text-gray-600">
                Selected: {selectedDistrict.district}, {selectedDistrict.state} - {formatValue(selectedDistrict.value)}
              </div>
            )}
          </div>
          <div className="p-4 relative">
            <div style={{ height: "600px", width: "100%" }}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1000,
                  center: [78.9629, 22.5937]
                }}
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                <Geographies geography={INDIA_TOPO_JSON}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const districtCode = geo.properties.dt_code;
                      const districtName = geo.properties.district;
                      const stateName = geo.properties.st_nm;
                      const districtInfo = getDistrictData(districtCode);
                      const value = getData(districtCode);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={value ? colorScale(value) : "#EEE"}
                          stroke="#FFF"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              outline: "none",
                              transition: 'all 250ms'
                            },
                            hover: {
                              fill: "#666",
                              outline: "none",
                              cursor: 'pointer'
                            },
                            pressed: {
                              outline: "none"
                            }
                          }}
                          onMouseEnter={() => {
                            const tooltipHtml = districtInfo 
                              ? `<div class="p-2">
                                  <div class="font-medium">${districtName}</div>
                                  <div class="text-xs text-gray-500">${stateName}</div>
                                  <div class="text-sm mt-1">Sales: ${formatValue(value)}</div>
                                </div>`
                              : `<div class="p-2">
                                  <div class="font-medium">${districtName}</div>
                                  <div class="text-xs text-gray-500">${stateName}</div>
                                  <div class="text-sm mt-1">No data available</div>
                                </div>`;
                            setTooltipContent(tooltipHtml);
                          }}
                          onMouseLeave={() => {
                            setTooltipContent("");
                          }}
                          onClick={() => {
                            const data = getDistrictData(districtCode);
                            setSelectedDistrict(data ? { ...data, district: districtName } : null);
                          }}
                          data-tooltip-id="map-tooltip"
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
              {renderLegend()}
            </div>
            <Tooltip 
              id="map-tooltip"
              html={tooltipContent}
              className="!bg-white !text-gray-800 !shadow-lg !rounded-lg !border !border-gray-200"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IndiaMapDemo; 