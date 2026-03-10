const setAuthCookies = (res, token) => {
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // Cross-site cookies
        maxAge: 15 * 24 * 60 * 60 * 1000
    })

}
export default setAuthCookies