import { Flex } from "@chakra-ui/react";
import { FC } from "react";

const Home: FC = () => {
  return (
    <Flex flexDir="column" w="100%">
      <Flex h={60} bgColor="orange.200">
        배너
      </Flex>
    </Flex>
  );
};

export default Home;
