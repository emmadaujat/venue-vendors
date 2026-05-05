import React, { useState } from "react";
import { Button, Text, useDisclosure } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  MenuItem,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";

function SignOutButton() {
  const { logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [done, setDone] = useState(false);

  // clears localStorage and logs user out
  function doLogout() {
    setDone(true);
    setTimeout(() => {
      // show success msg briefly then close and redirect
      onClose();
      setDone(false);
      logout();
    }, 2000);
  }

  return (
    <>
      <Text
        onClick={onOpen}
        fontSize="md"
        fontWeight="semibold"
        color="brand.primary"
        cursor="pointer"
        w="100%"
        px={3}
        py={2}
        _hover={{ textDecoration: "underline" }}
      >
        Sign Out
      </Text>
      {/* sign out confirmation popup */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          onClose();
          setDone(false);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.primary">
              Sign Out
            </AlertDialogHeader>

            <AlertDialogBody>
              {done ? (
                <Text>You have successfully been signed out!</Text>
              ) : (
                <Text>Are you sure you want to sign out?</Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              {!done && (
                <>
                  <Button ref={cancelRef} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    bg="brand.primary"
                    onClick={doLogout}
                    ml={3}
                    color="white"
                    _hover={{
                      bg: "transparent",
                      border: "2px solid",
                      borderColor: "brand.primary",
                      color: "brand.primary",
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default SignOutButton;
