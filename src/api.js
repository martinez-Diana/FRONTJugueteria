import axios from "axios";

const API = axios.create({
  baseURL: "https://back-jugueteria.vercel.app/",
  //baseURL: "http://localhost:4000/api",
});

export default API;

