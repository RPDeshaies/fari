import { css } from "@emotion/css";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Collapse from "@material-ui/core/Collapse";
import Container, { ContainerTypeMap } from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import useTheme from "@material-ui/core/styles/useTheme";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import EditIcon from "@material-ui/icons/Edit";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MenuIcon from "@material-ui/icons/Menu";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import truncate from "lodash/truncate";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { useLogger } from "../../contexts/InjectionsContext/hooks/useLogger";
import { useLightBackground } from "../../hooks/useLightBackground/useLightBackground";
import { AppLink } from "../AppLink/AppLink";
import { FateLabel } from "../FateLabel/FateLabel";
import MarkdownElement from "../MarkdownElement/MarkdownElement";
import { Page } from "../Page/Page";
import { PageMeta } from "../PageMeta/PageMeta";
import { IMarkdownIndex, IPage, MarkdownDocMode } from "./domains/Markdown";
import { ILoadFunction, useMarkdownFile } from "./hooks/useMarkdownFile";
import { useMarkdownPage } from "./hooks/useMarkdownPage";
import { useScrollOnHtmlLoad } from "./hooks/useScrollOnHtmlLoad";

export const drawerWidth = "300px";

type IProps = {
  title: string;
  /**
   * Prefix used by the document
   *
   * e.g. `/srds/condensed`
   */
  url: string;
  /**
   * Section right after the `props.url` which matches the current `<h1>` in the document
   *n
   * e.g. `/srds/condensed/{{h1}}`
   */
  page: string | undefined;
  /**
   * Section right after the `props.url` which matches the current `<h2>` in the document
   *
   * e.g. `/srds/condensed/taking-action-rolling-the-dice/{{h2}}`
   */
  subPage: string | undefined;
  /**
   * Where the user should go when clicking on the breadcrumb parent element
   */
  parent: {
    title: string;
    url: string;
  };
  /**
   * Author of the document as well as links
   */
  author?: {
    title: string;
    avatarUrl?: string;
    items: Array<{
      label: string;
      url: string;
    }>;
  };
  /**
   * Image visible on large views at the top of the document
   */
  imageUrl?: string;
  /**
   * Customize the max width of the document
   */
  maxWidth?: ContainerTypeMap["props"]["maxWidth"];
  /**
   * Disables Search Enginge tracking
   */
  noIndex?: boolean;
  /**
   * Function that returns the markdown document to parce
   */
  loadFunction: ILoadFunction;
  /**
   * Link to original file
   */
  gitHubLink?: string;
  /**
   * @default {MarkdownPageMode.H1sArePages}
   */
  docMode?: MarkdownDocMode;
};

export type IDocProps = IProps;

export const Doc: React.FC<IProps> = (props) => {
  const docMode = props.docMode ?? MarkdownDocMode.H1sArePages;

  const lightBackground = useLightBackground();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();
  const logger = useLogger();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = params.get("goTo");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openH1, setOpenH1] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const { dom, markdownIndexes } = useMarkdownFile({
    loadFunction: props.loadFunction,
    prefix: props.url,
    docMode: docMode,
  });
  const {
    html,
    nextPage,
    previousPage,
    currentPage,
    title,
    description,
  } = useMarkdownPage({
    url: props.url,
    page: props.page,
    subPage: props.subPage,
    section: section,
    dom: dom,
    docMode: docMode,
  });

  const shouldRenderImage = props.imageUrl && !isSmall;
  const shouldRenderSectionTitle = title !== props.title;

  useScrollOnHtmlLoad(html, section);

  useEffect(
    function onPageChange() {
      setOpenH1(props.page);

      window.scrollTo(0, 0);
    },
    [props.page, currentPage]
  );

  useEffect(
    function onSubPageChange() {
      if (docMode === MarkdownDocMode.H1sAndH2sArePages) {
        window.scrollTo(0, 0);
      }
    },
    [props.subPage]
  );

  useEffect(function onUnmount() {
    return () => {
      window.scrollTo(0, 0);
    };
  }, []);

  useEffect(
    function sendLog() {
      const logMessage = `Route:Document:${location.pathname}`;

      logger.info(logMessage, {
        pathname: location.pathname,
        page: props.page,
        section: section,
      });
    },
    [location.pathname]
  );

  useEffect(
    function transformHashToGoodUrl() {
      if (currentPage && location.hash) {
        const newSection = location.hash.replace("#", "");

        history.replace({
          pathname: location.pathname,
          search: `?goTo=${newSection}`,
        });
      }
    },
    [location.hash]
  );

  function handleMarkdownAnchorClick(e: Event) {
    e.preventDefault();
    const anchor = e.currentTarget as Element | undefined;
    const href = anchor?.getAttribute("href");

    if (!href) {
      return;
    }

    if (href?.startsWith("/") || href?.startsWith("#")) {
      history.push(href);
    } else {
      window.open(href);
    }
  }

  function handleGoToPage(page: IPage) {
    history.push(page.url);
  }

  useEffect(
    function connectTocAnchors() {
      {
        document.querySelectorAll("a").forEach((a) => {
          a.addEventListener("click", handleMarkdownAnchorClick);
        });

        return () => {
          document.querySelectorAll("a").forEach((a) => {
            a.removeEventListener("click", handleMarkdownAnchorClick);
          });
        };
      }
    },
    [html]
  );

  const docMarkdownStyle = css({
    "& ul.toc": {
      "&>li": {
        listStyle: `"📎 "`,
        listStylePosition: "outside",
      },
      [`&>li[data-toc-id="${currentPage?.id}"]`]: {
        "listStyle": `"👉 "`,
        "listStylePosition": "outside",
        "& > a": {
          color: theme.palette.text.secondary,
          pointerEvents: "none",
        },
      },
    },
  });

  return (
    <Page
      drawerWidth={!isSmall ? drawerWidth : undefined}
      pb="4rem"
      debug={{ metaTitle: title, metaDescription: description }}
      disableAutomaticScrollTop
    >
      <PageMeta
        title={shouldRenderSectionTitle ? `${title} | ${props.title}` : title}
        description={description}
        noIndex={props.noIndex}
      />
      {html ? (
        <Fade in>
          <Box display="flex">
            {renderTableOfContent()}
            <Box
              className={css({
                flexGrow: 1,
              })}
            >
              {shouldRenderImage && (
                <Box
                  className={css({
                    marginTop: "-2rem",
                    marginBottom: "1rem",
                    width: "100%",
                    height: isSmall ? "8rem" : "8rem",
                    display: "block",
                    backgroundSize: "cover",
                    backgroundRepeat: "repeat",
                    backgroundPosition: "center",
                    filter: "blur(8px)",
                    overflow: "hidden",
                    maskImage:
                      "linear-gradient(to bottom, #000 0%, transparent 100%)",
                    backgroundImage: `url("${props.imageUrl}")`,
                  })}
                />
              )}
              <Container maxWidth={props.maxWidth ?? "md"}>
                {renderAuthor()}
                {props.children && <Box>{props.children}</Box>}
                <Box>
                  <Box pb="1rem" mt="-1.5rem">
                    {renderHeader()}
                  </Box>
                  <Box mx="-.5rem">{renderNavigationButtons()}</Box>
                </Box>
                <Box className={docMarkdownStyle}>
                  <MarkdownElement renderedMarkdown={html} />
                </Box>
                {renderEditButton()}

                <Box my=".5rem">
                  <Divider />
                </Box>
                {renderNavigationButtons()}
                {renderMobileMenu()}
              </Container>
            </Box>
          </Box>
        </Fade>
      ) : (
        renderIsLoading()
      )}
    </Page>
  );

  function renderEditButton() {
    if (!props.gitHubLink) {
      return null;
    }
    return (
      <Box my=".5rem">
        <Grid container justify="flex-end">
          <Grid item>
            <Button
              color="primary"
              component="a"
              startIcon={<EditIcon />}
              target="_blank"
              rel="noreferrer"
              href={props.gitHubLink}
            >
              Edit this Page
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  function renderAuthor() {
    if (!props.author) {
      return null;
    }
    return (
      <Box>
        <Grid container spacing={1} justify="space-between">
          <Grid container item sm={12} md spacing={1} alignItems="center">
            <Grid item className={css({ display: "flex" })}>
              {props.author.avatarUrl ? (
                <Avatar alt={props.author.title} src={props.author.avatarUrl} />
              ) : (
                <AccountBoxIcon />
              )}
            </Grid>
            <Grid item zeroMinWidth>
              <FateLabel variant="body2" color="primary" noWrap>
                <b>{props.author.title}</b>
              </FateLabel>
            </Grid>
          </Grid>
          <Grid
            container
            item
            sm={12}
            md
            spacing={1}
            justify={isSmall ? "flex-start" : "flex-end"}
            alignItems="center"
          >
            {props.author.items.map((item, index) => {
              const length = props.author?.items.length ?? 0;
              const isLast = index === length - 1;

              return (
                <React.Fragment key={item.url}>
                  <Grid item>
                    <AppLink to={item.url} target="_blank" underline="always">
                      <b> {item.label}</b>
                    </AppLink>
                  </Grid>
                  {!isLast && (
                    <Grid item>
                      <FateLabel color="secondary">{"•"}</FateLabel>
                    </Grid>
                  )}
                </React.Fragment>
              );
            })}
          </Grid>
        </Grid>
        <Box pt=".5rem" pb="3rem">
          <Divider />
        </Box>
      </Box>
    );
  }

  function renderTitle() {
    return (
      <Breadcrumbs aria-label="breadcrumb">
        <FateLabel noWrap>
          <AppLink to={props.parent.url} noWrap underline="always">
            {props.parent.title}
          </AppLink>
        </FateLabel>
        <FateLabel noWrap> {props.title}</FateLabel>
      </Breadcrumbs>
    );
  }

  function renderMobileMenu() {
    return (
      <Hidden mdUp>
        <Box
          p=".5rem"
          className={css({
            position: "fixed",
            bottom: "0",
            left: "0",
            width: "100%",
            boxShadow: theme.shadows[24],
            background: lightBackground,
          })}
        >
          <Grid container spacing={1} alignItems="center" wrap="nowrap">
            <Grid item>
              <IconButton
                color="inherit"
                onClick={() => {
                  setMobileMenuOpen(true);
                }}
              >
                <MenuIcon color="inherit" />
              </IconButton>
            </Grid>
            <Grid item zeroMinWidth>
              <Box>
                <FateLabel noWrap> {props.title}</FateLabel>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Hidden>
    );
  }

  function renderHeader() {
    return (
      <Grid container justify="space-between" alignItems="flex-end" spacing={2}>
        <Grid item md={7} xs={12} zeroMinWidth>
          {renderTitle()}
        </Grid>
        <Grid item md={5} xs={12}>
          {renderAutoComplete()}
        </Grid>
      </Grid>
    );
  }

  function renderNavigationButtons() {
    return (
      <Box
        display="flex"
        justifyContent={
          previousPage && !nextPage
            ? "flex-start"
            : !previousPage && nextPage
            ? "flex-end"
            : "space-between"
        }
      >
        {previousPage && (
          <Button
            startIcon={<NavigateBeforeIcon />}
            color="primary"
            data-cy="doc.previous"
            onClick={() => {
              handleGoToPage(previousPage);
            }}
          >
            {truncate(previousPage?.label ?? "", { length: 50 })}
          </Button>
        )}

        {nextPage && (
          <Button
            endIcon={<NavigateNextIcon />}
            color="primary"
            data-cy="doc.next"
            onClick={() => {
              handleGoToPage(nextPage);
            }}
          >
            {truncate(nextPage?.label ?? "", { length: 50 })}
          </Button>
        )}
      </Box>
    );
  }

  function renderAutoComplete() {
    return (
      <Box width="100%">
        <Autocomplete
          freeSolo
          size="small"
          autoHighlight
          filterOptions={createFilterOptions({ limit: 10 })}
          options={markdownIndexes.flat.map((i) => i)}
          groupBy={(index) => index.pageLabel ?? ""}
          getOptionLabel={(index) => index.label}
          inputValue={search}
          onInputChange={(e, value, reason) => {
            if (reason === "input") {
              setSearch(value);
            } else {
              setSearch("");
            }
          }}
          onChange={(event, newValue) => {
            const label = (newValue as IMarkdownIndex)?.id;
            if (label) {
              const index = markdownIndexes.flat.find(
                (index) => label === index.id
              );

              if (index?.url) {
                history.push(index.url);
              }
            }
          }}
          renderOption={(header) => (
            <React.Fragment>
              <Box width="100%">
                <Grid container alignItems="center">
                  <Grid item>{header.label}</Grid>
                </Grid>
                <Box>
                  <Typography variant="body2" noWrap color="textSecondary">
                    {header.preview}
                  </Typography>
                </Box>
              </Box>
            </React.Fragment>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              className={css({ width: "100%", margin: "0" })}
              label="Search"
              margin="normal"
            />
          )}
        />
      </Box>
    );
  }

  function renderTableOfContent() {
    const list = (
      <List>
        {markdownIndexes.tree.map((h1, i) => {
          const shouldRenderExpandIcon = h1.children.length > 0;
          const isSubSectionOpen = !openH1 ? i === 0 : openH1 === h1.id;

          return (
            <React.Fragment key={i}>
              <MenuItem
                button
                dense
                selected={isSubSectionOpen && !props.subPage && !section}
                component={Link}
                to={`${props.url}/${h1.id}`}
                data-cy={`doc.table-of-content.h1`}
                data-cy-page-id={h1.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
              >
                {renderTableOfContentElement(h1)}
                {shouldRenderExpandIcon && (
                  <>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenH1((draft) => {
                          if (draft === h1.id) {
                            return undefined;
                          }
                          return h1.id;
                        });
                      }}
                    >
                      {isSubSectionOpen ? (
                        <ExpandLessIcon htmlColor={theme.palette.text.hint} />
                      ) : (
                        <ExpandMoreIcon htmlColor={theme.palette.text.hint} />
                      )}
                    </IconButton>
                  </>
                )}
              </MenuItem>
              <Collapse
                in={isSubSectionOpen}
                data-cy={`doc.table-of-content.${h1.id}.h2s`}
              >
                {h1.children.map((h2, h2Index) => {
                  if (h2.level !== 2) {
                    return null;
                  }
                  const url =
                    docMode === MarkdownDocMode.H1sAndH2sArePages
                      ? `${props.url}/${h1.id}/${h2.id}`
                      : `${props.url}/${h1.id}/?goTo=${h2.id}`;
                  return (
                    <React.Fragment key={h2Index}>
                      <MenuItem
                        button
                        dense
                        selected={props.subPage === h2.id && !section}
                        key={h2Index}
                        component={Link}
                        to={url}
                        data-cy={`doc.table-of-content.h2`}
                        data-cy-page-id={h2.id}
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                      >
                        {renderTableOfContentElement(h2)}
                      </MenuItem>
                      {false &&
                        h2.children.map((h3, h3Index) => {
                          if (h3.level !== 3) {
                            return null;
                          }
                          return (
                            <MenuItem
                              button
                              dense
                              selected={section === h3.id}
                              key={h3Index}
                              component={Link}
                              to={`${props.url}/${h1.id}/${h2.id}/${h3.id}`}
                              data-cy={`doc.table-of-content.h2`}
                              data-cy-page-id={h3.id}
                              onClick={() => {
                                setMobileMenuOpen(false);
                              }}
                            >
                              {renderTableOfContentElement(h3)}
                            </MenuItem>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    );

    return (
      <>
        <Hidden mdUp>
          <Drawer
            anchor="bottom"
            open={mobileMenuOpen}
            onClose={() => {
              setMobileMenuOpen(false);
            }}
            classes={{
              paper: css({
                background: lightBackground,
              }),
            }}
          >
            <Box p="2rem">{list}</Box>
          </Drawer>
        </Hidden>
        <Hidden smDown>
          <Drawer
            variant="permanent"
            anchor="left"
            open={true}
            classes={{
              root: css({
                width: drawerWidth,
                flexShrink: 0,
              }),
              paper: css({
                width: drawerWidth,
                background: lightBackground,
              }),
            }}
          >
            <Box mt="4.9rem" />
            <Divider />
            {list}
          </Drawer>
        </Hidden>
      </>
    );
  }

  function renderTableOfContentElement(index: IMarkdownIndex) {
    return (
      <ListItemText
        primary={
          <Box
            display="inline-block"
            title={index.label}
            className={css({
              width: "100%",
              display: "inline-block",
              paddingLeft: `${(index.level - 1) * 1}rem`,
            })}
          >
            {index.level < 2 ? (
              <Typography
                noWrap
                className={css({
                  fontWeight: "bold",
                  width: "100%",
                  display: "inline-block",
                })}
                dangerouslySetInnerHTML={{
                  __html: index.label,
                }}
              />
            ) : (
              <Typography
                noWrap
                className={css({
                  width: "100%",
                  display: "inline-block",
                })}
                dangerouslySetInnerHTML={{
                  __html: index.label,
                }}
              />
            )}
          </Box>
        }
      />
    );
  }

  function renderIsLoading() {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
};
