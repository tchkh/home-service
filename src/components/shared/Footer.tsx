import { useState } from 'react'
import Image from 'next/image'
import { termsContent, privacyContent } from '@/data/legal'
import LegalModal from './LegalModal'

function Footer() {
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <footer className="bg-[color:var(--white)] pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-20 gap-5 md:mb-10">
          {/* Logo & Contact */}
          <div className="flex items-center mb-2 gap-2 md:flex md:justify-center">
            <Image
              src="/asset/svgs/houseLogo.svg"
              width={32}
              height={32}
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
              <Image
                src="/asset/svgs/telephone.svg"
                width={20}
                height={20}
                alt="telephone icon"
                className="w-[20px] h-[20px]"
              />
              <a href="tel:0805406157" className="block">
                <span>080-540-6157</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/asset/svgs/email.svg"
                width={20}
                height={20}
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

      {/* Bottom Section */}
      <div className="bg-[color:var(--gray-100)] p-3 mt-6 md:px-20">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Copyright */}
          <p className="text-body-4 text-[color:var(--gray-500)] order-3 md:order-1">
            copyright © 2021 HomeServices.com All rights reserved
          </p>

          {/* Spacer */}
          <div className="h-2 md:hidden" />

          {/* Links */}
          <div className="text-body-3 flex flex-col md:flex-row md:gap-5 order-1 md:order-3">
            <button
              onClick={() => setShowTermsModal(true)}
              className=" text-[color:var(--gray-700)] hover:text-(--blue-600) hover:underline text-left cursor-pointer"
            >
              ข้อตกลงและเงื่อนไข
            </button>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className=" text-[color:var(--gray-700)] hover:text-(--blue-600) hover:underline text-left cursor-pointer"
            >
              นโยบายความเป็นส่วนตัว
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LegalModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="ข้อตกลงและเงื่อนไข"
        content={termsContent}
      />
      <LegalModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="นโยบายความเป็นส่วนตัว"
        content={privacyContent}
      />
    </footer>
  )
}

export default Footer
