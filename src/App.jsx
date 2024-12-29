import "./App.css"
import { useState,useEffect ,useRef} from "react";
import {useForm} from "react-hook-form"


function App(){
  let ltlng=useRef({"lat":null, "lng":null})
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [data, setData] = useState([]);
  const placemark=useRef()
  const removemark=useRef()
  let isclicked=false

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors ,isSubmitting},
  } = useForm()

  async function submit_data(data) {
    // Assign the lat and lng to form data before submitting
    data.lat = ltlng.current.lat;
    data.lng = ltlng.current.lng;
  
    // Ensure ltlng has valid data before submitting
    if (!data.lat || !data.lng) {
      alert("Please place a marker on the map first.");
      return;
    }
  
    console.log("Submitting data:", data);
  
    const response = await fetch("https://underradar-backend.onrender.com/", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
    
  

  }

  const delay=()=>{
    return new Promise((res,rej)=>{
      setTimeout(() => {
        res()
      },3000 );
    })
  }


  function show_form(){
    if(isclicked==true){
      document.getElementById("form").style.display="flex";
      document.getElementById("form").style.flexDirection="column";
    }
    else{
      alert("Select a place by either searching on search bar or manually marking on map")
    }
  }
  function remove_last_marker(){
    lastmarker.position=null
    isclicked=false
    ltlng.current.lat=null
    ltlng.current.lng=null
    removemark.current.style.display="none"
    placemark.current.style.backgroundColor="#374151"
    placemark.current.style.color="##9ca3af"
    placemark.current.style.cursor="not-allowed"
    
    }
  function changebuttonui(){
    if(isclicked==true){
      placemark.current.style.backgroundColor="#1e40af"
      placemark.current.style.color="white"
      placemark.current.style.cursor="pointer"
      removemark.current.style.display="block"
    }
  }
  useEffect(() => {
     fetch("https://underradar-backend.onrender.com/")
  .then(async (res) => {
    let a = await res.json();
    console.log(a);
    
    // Map through each item in the array to extract PlaceID
    
    const markers = a.map(item => ({
      name: item.Name,
      place: item.Place,
      review: item.Review,
      color: item.Color,
      lat: item.lat,
      lng: item.lng,
    }));

    setData(markers); // Set data with the array of PlaceIDs
    
    
  })
  .catch((error) => console.error("Error fetching data:", error));
    
    
  },[] );

useEffect(()=>{
  if(data.length>0){
    initMap()
    
  }
},[data]) 
useEffect(()=>{
  if(isMapInitialized){
    findPlaces()
  }
},[isMapInitialized])
let map;
let marker;
let infoWindow;
let lastmarker;

async function initMap() {
  const position = { lat: 28.6273, lng: 77.3007 };
  
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  
  map =await new Map(document.getElementById("map"), {
    zoom: 11,
    center: position,
    mapId: "DEMO_MAP_ID",
    disableDefaultUI: true,
    gmpClickable: true,
    
  });
 
  function addMarker(latlng){
    
    ltlng.current={lat:latlng.lat(),lng:latlng.lng()}
    
    
    
    
    let currposition={lat: latlng.lat(),lng: latlng.lng()}
     lastmarker= new AdvancedMarkerElement({
      map:map,
      position: currposition,
    
      
      gmpClickable: true,
    })
    
    isclicked=true
    changebuttonui()
  }

  map.addListener("click",({latLng})=>{
    if(isclicked==false){
      addMarker(latLng)
      
    }
    
  
   
  })
  defaultmarkers()
  findPlaces()
 
 
 
}
async function defaultmarkers(){
  
  
  const { Place } = await google.maps.importLibrary("places");
  const { PinElement,AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  
  async function updateMarkers(data) {
    
    let image = document.createElement("img");
    image.style.width="30px"
    image.style.borderRadius="30px"
    image.src ="https://pixlr.com/images/index/ai-image-generator-one.webp"
    

    
    
    for (let i=0;i<=data.length;i++) {
      // const place = new Place({
      //   id: e,
      // });
      
      // await place.fetchFields({
      //   fields: ["displayName", "formattedAddress", "location"],
      // });
      // const pinBackground = new PinElement({
      //   background: "#FBBC04",
      // }); 
      const titl= `Place: ${data[i].place} \n ,Name: ${data[i].name} \n, Review: ${data[i].review}`
      const pinBackground = new PinElement({
        background: data[i].color,
      });
      const marker = new AdvancedMarkerElement({
        map,
        position: {lat: parseFloat(data[i].lat.$numberDecimal), lng:parseFloat(data[i].lng.$numberDecimal)},
        content: pinBackground.element,
        title: titl,
        gmpClickable: true,
        
      });
      marker.addEventListener("gmp-click",()=>{
      

        infoWindow.close();
        infoWindow.setContent(marker.title);
        infoWindow.open(marker.map, marker);
      })
    }
  }
  
  // Usage
  updateMarkers(data);
  findPlaces()
}
async function findPlaces() {
  
  
  
  // const request = {
  //   textQuery: "pizzalicious",
  //   fields: ["displayName", "location", "businessStatus", "reviews"],
  //   includedType: "restaurant",
  //   locationBias: { lat: 28.66726540759533, lng: 77.30233064675153 },
  //   isOpenNow: true,
  //   language: "en-US",
  //   maxResultCount: 8,
  //   useStrictTypeFiltering: false,
  // };
  // //@ts-ignore
  // const { places } = await Place.searchByText(request);

  // if (places.length) {
  //   console.log(places);

  //   const { LatLngBounds } = await google.maps.importLibrary("core");
  //   const bounds = new LatLngBounds();

  //   // Loop through and get all the results.
  //   places.forEach((place) => {
  //     const markerView = new AdvancedMarkerElement({
  //       map,
  //       position: place.location,
  //       title: place.displayName,
  //     });

  //     bounds.extend(place.location);
  //     console.log(place);
  //   });
  //   map.fitBounds(bounds);
  // } else {
  //   console.log("No results");
  // }
  
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();

  
    placeAutocomplete.id = "place-autocomplete-input";
    
    const card = document.getElementById("place-autocomplete-card");
  
    document.getElementById("card").appendChild(placeAutocomplete);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);
    
    // Create the marker and infowindow
   let loc;
    infoWindow = new google.maps.InfoWindow({});
    // Add the gmp-placeselect listener, and display the results on the map.
    //@ts-ignore
    placeAutocomplete.addEventListener("gmp-placeselect", async ({ place }) => {
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location","id"],
        
      });
      
      // If the place has a geometry, then present it on a map.
      if (place.viewport) {
        map.fitBounds(place.viewport);
      } else {
        isclicked=true
        changebuttonui()
        loc=place.location
        
        ltlng.current.lat=place.location.lat()
        ltlng.current.lng=place.location.lng()
        map.setCenter(place.location);
        map.setZoom(17);
      }
      lastmarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: loc,
      });
      
      let content =
        '<div id="infowindow-content">' +
        '<span id="place-displayname" class="title">' +
        place.displayName +
        "</span><br />" +
        '<span id="place-address">' +
        place.formattedAddress +
        "</span>" +
        "</div>";
  
      updateInfoWindow(content, place.location);
      marker.position = place.location;
    });
 
}
function updateInfoWindow(content, center) {
  infoWindow.setContent(content);
  infoWindow.setPosition(center);
  infoWindow.open({
    map,
    anchor: marker,
    shouldFocus: false,
  });
}


  return <>
  
    <div className="nav flex justify-center">
      <span className="flex justify-center items-center">
        <img src="https://i.ibb.co/z2z2kxx/Designer-4-removebg-preview.png" alt="" />
        <h1 className=" text-5xl font-bold tracking-wide">UnderRadar</h1>
      </span>
      <button className="text-white relative border-none" onClick={()=>{
         document.getElementById("about").scrollIntoView({
          behavior: "smooth"
      });
      }}>About Me</button>
      
    </div>
    <div class=" hero background flex flex-col items-center gap-8 ">
      <div className="heading flex flex-col items-center justify-center gap-4 relative">
      <h1 className="text-5xl text-white tracking-widest mt-10">Explore Underrated Spots </h1>
      <h2 className="text-4xl text-white tracking-wider">or</h2>
      <h1 className="text-5xl text-white tracking-widest ">Share Your Own Ones</h1>
      </div>
     <div className="subtext text-slate-400 w-2/3 text-center text-xl">
     Discover hidden gems on UnderRadar! Explore lesser-known cafes, restaurants, bakeries, and more, all marked by fellow explorers like you. Found a spot you love? Share it with the community,whether it’s a cozy local café or a unique hangout. Let’s uncover the underrated together!
     </div>
     <button onClick={()=>{
       document.getElementById("main").scrollIntoView({
        behavior: "smooth"
    })
     } } className="take rounded-lg">Take Me</button>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
</div>
    
    <div className="main" id="main">

    <div id="card">
      *Search Places Here or Mark Directly On Map
    </div>
  
    <div id="map"></div>
    </div>
   
    <div className="form " id="form">
      <span id="svg" onClick={()=>{
        document.getElementById("form").style.display="none"
        
      }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="#000000" fill="none">
    <path d="M19.0005 4.99988L5.00049 18.9999M5.00049 4.99988L19.0005 18.9999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
      </span>
        <form action="/" onSubmit={handleSubmit(submit_data)}>

      <h1>Your Name</h1>
      <input type="text" id="name" {...register("Name",{required:true})} />
      {errors.Name && alert("Required Field")}
      <h1>Place Name</h1>
      <input type="text" {...register("Place",{required:true})} />
      {errors.Place && alert("Required Field")}
      <h1>Experience/Review</h1>
      <textarea id="textarea" cols="30" rows="7" {...register("Review",{required:true})} ></textarea>
      {errors.Review && alert("Required Field")}
      <h1>Marker Color</h1>
      <input type="color" name="" id="color" {...register("Color")} />
      <input type="text" {...register("lat")} className="hidden" id="lat" value={ltlng.current.lat || ""} />
      <input type="text" {...register("lng")} className="hidden" id="lng" value={ltlng.current.lng || ""} />
      <input type="submit" disabled={isSubmitting} id="submit" onClick={ async ()=>{
        await delay()
        window.location.reload()
      }} />
      {isSubmitting && <p>Submittng......</p>}
        </form>
      
      
    </div>
    <div className="confirm w-full flex justify-center h-14 items-center">
      <button ref={placemark} id="placebutt" className="bg-gray-700 w-1/5 rounded-md h-9 m-auto text-gray-400 button" onClick={show_form}>Place Marker?</button>
      <button ref={removemark} id="removebutt" className="bg-red-700 w-1/5 rounded-md h-9 m-auto text-white button" onClick={remove_last_marker}>Remove Marker?</button>
    </div>
    <div className="about flex justify-center flex-col items-center" id="about">
      <h1 className="text-5xl text-white font-bold my-20">About Me</h1>
      <div className="my-image rounded-full h-32 w-32"></div>
      <div className="info w-1/2 h-72 text-slate-400 text-center flex justify-center flex-col items-center">
      I am Aman Sharma, a second-year Computer Science and Engineering student at ADGIPS with a strong foundation in the MERN stack. Passionate about web development and problem-solving, I enjoy building interactive, user-friendly applications that create meaningful impact.<br></br> This Project is my first complete MERN stack project which was developed for the sole reason of learning and showcasing, hope you liked it !
      <div className="svg flex m-4">

       
        <a href="https://github.com/AmanSharma619/" target="_blank">
        
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 30 30">
    <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z" fill="white"></path>
    
</svg>
</a>
<a href="https://www.linkedin.com/in/aman-sharma-4a3166284/" target="_blank">
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50">
<path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 14 11.011719 C 12.904779 11.011719 11.919219 11.339079 11.189453 11.953125 C 10.459687 12.567171 10.011719 13.484511 10.011719 14.466797 C 10.011719 16.333977 11.631285 17.789609 13.691406 17.933594 A 0.98809878 0.98809878 0 0 0 13.695312 17.935547 A 0.98809878 0.98809878 0 0 0 14 17.988281 C 16.27301 17.988281 17.988281 16.396083 17.988281 14.466797 A 0.98809878 0.98809878 0 0 0 17.986328 14.414062 C 17.884577 12.513831 16.190443 11.011719 14 11.011719 z M 14 12.988281 C 15.392231 12.988281 15.94197 13.610038 16.001953 14.492188 C 15.989803 15.348434 15.460091 16.011719 14 16.011719 C 12.614594 16.011719 11.988281 15.302225 11.988281 14.466797 C 11.988281 14.049083 12.140703 13.734298 12.460938 13.464844 C 12.78117 13.19539 13.295221 12.988281 14 12.988281 z M 11 19 A 1.0001 1.0001 0 0 0 10 20 L 10 39 A 1.0001 1.0001 0 0 0 11 40 L 17 40 A 1.0001 1.0001 0 0 0 18 39 L 18 33.134766 L 18 20 A 1.0001 1.0001 0 0 0 17 19 L 11 19 z M 20 19 A 1.0001 1.0001 0 0 0 19 20 L 19 39 A 1.0001 1.0001 0 0 0 20 40 L 26 40 A 1.0001 1.0001 0 0 0 27 39 L 27 29 C 27 28.170333 27.226394 27.345035 27.625 26.804688 C 28.023606 26.264339 28.526466 25.940057 29.482422 25.957031 C 30.468166 25.973981 30.989999 26.311669 31.384766 26.841797 C 31.779532 27.371924 32 28.166667 32 29 L 32 39 A 1.0001 1.0001 0 0 0 33 40 L 39 40 A 1.0001 1.0001 0 0 0 40 39 L 40 28.261719 C 40 25.300181 39.122788 22.95433 37.619141 21.367188 C 36.115493 19.780044 34.024172 19 31.8125 19 C 29.710483 19 28.110853 19.704889 27 20.423828 L 27 20 A 1.0001 1.0001 0 0 0 26 19 L 20 19 z M 12 21 L 16 21 L 16 33.134766 L 16 38 L 12 38 L 12 21 z M 21 21 L 25 21 L 25 22.560547 A 1.0001 1.0001 0 0 0 26.798828 23.162109 C 26.798828 23.162109 28.369194 21 31.8125 21 C 33.565828 21 35.069366 21.582581 36.167969 22.742188 C 37.266572 23.901794 38 25.688257 38 28.261719 L 38 38 L 34 38 L 34 29 C 34 27.833333 33.720468 26.627107 32.990234 25.646484 C 32.260001 24.665862 31.031834 23.983076 29.517578 23.957031 C 27.995534 23.930001 26.747519 24.626988 26.015625 25.619141 C 25.283731 26.611293 25 27.829667 25 29 L 25 38 L 21 38 L 21 21 z" fill="white"></path>
</svg>
</a>
      </div>
      </div>
    
    </div>
    </>
}
export default App;
