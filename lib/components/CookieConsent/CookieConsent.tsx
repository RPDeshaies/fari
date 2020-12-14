import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import React, { useState } from "react";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";

const cookieConsentLocalStorageKey = "cookie-consent";

type ICookieConsent = "true" | undefined;
export const CookieConsent: React.FC<{}> = (props) => {
  const valueFromStorage = localStorage.getItem(
    cookieConsentLocalStorageKey
  ) as ICookieConsent;

  const [consent, setConsent] = useState<ICookieConsent>(valueFromStorage);
  const { t } = useTranslate();
  const open = consent !== "true";

  function handleClose() {
    setConsent("true");
    localStorage.setItem(cookieConsentLocalStorageKey, "true");
  }
  return (
    <Snackbar
      open={open}
      autoHideDuration={null}
      message={t("cookie-consent.description")}
      action={
        <Box>
          <Button
            color="inherit"
            onClick={handleClose}
            data-cy="cookie-consent"
          >
            {t("cookie-consent.button")}
          </Button>
        </Box>
      }
    />
  );
};

CookieConsent.displayName = "CookieConsent";
