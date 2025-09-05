import Cookies from 'js-cookie'

export const useAuth = () => {
  const token = Cookies.get('token') // adjust to match your JWT cookie name
  console.log("cookie for header", token);
  
  return {
    isLoggedIn: !!token,
  }
}
