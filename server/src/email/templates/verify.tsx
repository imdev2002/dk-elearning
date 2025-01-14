import React, { SVGProps } from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
  Img,
} from '@react-email/components';

const VerifyEmail = ({
  userFirstName = 'User',
  verifyLink = 'Flight Deck',
}) => (
  <Html>
    <Head />
    <Preview>Verify your account</Preview>
    <Tailwind>
      <Body className={main}>
        <Container className={container} style={{ maxWidth: 'unset' }}>
          <div className="bg-blue-500 px-4 mb-2 relative">
            <Link
              href="https://dkelearning.vercel.app"
              className="flex text-white gap-x-2"
              style={{ display: 'flex' }}
            >
              <img
                src="https://i.imgur.com/spX3OOe.png"
                alt=""
                className="absolute top-2/4 -translate-y-2/4"
                style={{ height: '26px', objectFit: 'cover' }}
              />
              <p className="ml-10 font-semibold text-lg leading-none">
                Dang Khai
              </p>
            </Link>
          </div>
          <Img
            src="https://static.vecteezy.com/system/resources/previews/016/131/298/non_2x/envelope-with-confirmed-document-icon-in-comic-style-verify-cartoon-illustration-on-white-isolated-background-receive-splash-effect-business-concept-vector.jpg"
            width="0"
            height="0"
            sizes="1000px"
            alt=""
            className="block object-cover w-[280px] h-auto mx-auto"
          />

          <Text className="text-center text-base">
            We're happy you're here. Let's get your email address verified
          </Text>
          <Link
            className="block text-base mx-auto w-fit px-8 py-3 bg-blue-500 text-white font-semibold rounded-md"
            href={verifyLink}
          >
            Verify Email Address
          </Link>
          <div className="bg-slate-300 py-4 mt-4 text-sm text-center">
            Copyright © 2024 Dang Khai Education. All rights reserved.
          </div>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default VerifyEmail;

const main = `bg-white font-['-apple-system,BlinkMacSystemFont,"Segoe_UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica_Neue",sans-serif'] text-black`;
// const container = 'p-5 pb-12 w-[60%]';
const container = 'p-5 pb-12 px-15 max-w-screen-sm';
const paragraph = 'text-base leading-[26px] text-start';
