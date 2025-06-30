const isSellerMiddleware = (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: "Anda harus login terlebih dahulu" });
    }
    
    if (user.role !== "seller" && user.role !== "superadmin" && user.role !== "validator") {
      return res.status(403).json({ 
        message: "Akses ditolak. Anda harus menjadi seller untuk melakukan operasi ini" 
      });
    }
    
    next();
  };
  
  module.exports = isSellerMiddleware;