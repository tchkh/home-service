function Footer() {
  return (
    <footer className="bg-white pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-20 gap-5">
          {/* Logo & Contact */}
            <div className="flex items-center mb-2 gap-2 md:flex md:justify-center">
            <img 
                src="/asset/svgs/houseLogo.svg" 
                alt="house icon" 
                className="md:w-[32px] md:h-[32px] w-[40px] h-[40px]"
              />
              <span className="text-[30px] font-medium text-[color:var(--blue-600)]">
                HomeServices
              </span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-heading-4">บริษัท โฮมเซอร์วิสเซส จำกัด</h3>
            <p className="text-body-3 text-[color:var(--gray-800)]">
              452 ซอยสุขุมวิท 79 แขวงพระโขนงเหนือเขตวัฒนา กรุงเทพมหานคร 10260
            </p>
          </div>
          <div className="text-[color:var(--gray-800)] flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <img 
                    src="/asset/svgs/telephone.svg" 
                    alt="telephone icon" 
                    className="w-[20px] h-[20px]"
                    />
                <a href="tel:0805406157" className="block">
                  <span>080-540-6157</span>
                </a>
            </div>
            <div className="flex items-center gap-2">
                <img 
                    src="/asset/svgs/email.svg" 
                    alt="email icon" 
                    className="w-[20px] h-[20px]"
                />
                <a href="mailto:contact@homeservices.co">
                  <span>contact@homeservices.co</span>
                </a>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[color:var(--gray-100)] p-3 mt-6">
          <div className="md:flex md:justify-between md:text-center">
            <div className="text-body-3 text-[color:var(--gray-700)] flex flex-col md:flex md:flex-row md:gap-5">
                <a href="#">เงื่อนไขและข้อตกลงการใช้งานเว็บไซต์</a>
                <a href="#">นโยบายความเป็นส่วนตัว</a>
            </div>
            <p className="text-body-4 text-[color:var(--gray-500)] pt-3">copyright © 2021 HomeServices.com All rights reserved</p>
          </div>
        </div>
    </footer>
  );
}

export default Footer;
