import { imgUrl } from "../hooks/useAxios"


const imageFullUrl =(url:string)=>{
return `${imgUrl}/${url}`
}
export {imageFullUrl}