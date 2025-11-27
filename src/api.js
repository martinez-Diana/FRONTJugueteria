import axios from "axios";

const API = axios.create({
  //baseURL: "https://jmbackend-production.up.railway.app",
  baseURL: "http://localhost:4000",
});

export default API;

