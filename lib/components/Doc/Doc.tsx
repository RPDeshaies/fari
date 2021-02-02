import { css } from "@emotion/css";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container, { ContainerTypeMap } from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import ListItemText from "@material-ui/core/ListItemText";
import useTheme from "@material-ui/core/styles/useTheme";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import EditIcon from "@material-ui/icons/Edit";
import MenuIcon from "@material-ui/icons/Menu";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import truncate from "lodash/truncate";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
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

type ISideBarElement = Array<string | IDocSidebar>;

export type IDocSidebar = {
  [category: string]: ISideBarElement;
};

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
  sideBar?: IDocSidebar;
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
  console.debug(
    "h2",
    markdownIndexes.flat
      .filter((i) => i.level === 2)
      .map((i) => i.id)
      .join(",")
  );

  const {
    pageDom,
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

  const html = pageDom?.innerHTML;
  // usePageHtml({ markdownIndexes, currentPage, pageDom });

  const shouldRenderImage = props.imageUrl && !isSmall;
  const shouldRenderSectionTitle = title !== props.title;
  const fullPath = location.pathname + location.search;

  useScrollOnHtmlLoad(html, section);
  useEffect(
    function trackOpenH1OnCurrentPageChange() {
      if (currentPage?.level === 1) {
        setOpenH1(currentPage.id);
      }
    },
    [currentPage]
  );
  useEffect(
    function trackOpenH1OnPageChange() {
      setOpenH1(props.page);
    },
    [props.page]
  );

  useEffect(
    function scrollOnPageChange() {
      if (!fullPath.includes("?")) {
        window.scrollTo(0, 0);
      }
    },
    [fullPath]
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
            {renderSideBar()}
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
              <Container maxWidth={("lg" || props.maxWidth) ?? "md"}>
                {renderAuthor()}
                {props.children && <Box>{props.children}</Box>}
                <Box>
                  <Box pb="1rem" mt="-1.5rem">
                    {renderHeader()}
                  </Box>
                </Box>
                <Grid container>
                  <Grid item xs>
                    <Box px={2}>
                      <MarkdownElement renderedMarkdown={html} />
                    </Box>
                  </Grid>
                  <Hidden mdDown>
                    <Grid item lg={3}>
                      <Box
                        px={2}
                        className={css({
                          position: "sticky",
                          top: "0",
                        })}
                      >
                        {renderTableOfContents()}
                      </Box>
                    </Grid>
                  </Hidden>
                </Grid>

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

  function renderTableOfContents() {
    const currentIndex = markdownIndexes.flat.find(
      (i) => i.id === currentPage?.id
    );

    const shouldNotRenderTableOfContents =
      currentIndex?.level === 1 && docMode !== MarkdownDocMode.H1sArePages;

    if (shouldNotRenderTableOfContents) {
      return null;
    }

    return (
      <>
        <Box
          className={css({
            marginTop: "4.5rem",
            height: "100%",
            maxHeight: "100vh",
            position: "sticky",
            top: "0",
            borderLeft: "1px solid #dadde1",
            overflowY: "auto",
          })}
        >
          {renderTableOfContentItem(currentIndex)}
        </Box>
      </>
    );
  }

  function renderTableOfContentItem(index: IMarkdownIndex | undefined) {
    if (!index) {
      return null;
    }
    return (
      <ul
        className={css({
          listStyleType: "none",
          marginTop: "0",
          marginBottom: "0",
          paddingLeft: ".5rem",
        })}
      >
        {index.children.map((child) => {
          return (
            <li
              key={child.id}
              className={css({
                margin: ".5rem",
              })}
            >
              <AppLink
                to={child.url ?? ""}
                className={css({
                  color: theme.palette.text.secondary,
                })}
              >
                {child.label}
              </AppLink>
              {child.children.length > 1 && renderTableOfContentItem(child)}
            </li>
          );
        })}
      </ul>
    );
  }

  function renderEditButton() {
    if (!props.gitHubLink) {
      return null;
    }
    const githubHash = props.page ? `#${props.page}` : "";
    return (
      <Box my=".5rem">
        <Grid container justify="flex-end">
          <Grid item>
            <Button
              color="secondary"
              size="small"
              component="a"
              startIcon={<EditIcon />}
              target="_blank"
              rel="noreferrer"
              href={`${props.gitHubLink}${githubHash}`}
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
      <Grid
        container
        spacing={2}
        justify={
          previousPage && !nextPage
            ? "flex-start"
            : !previousPage && nextPage
            ? "flex-end"
            : "space-between"
        }
      >
        {previousPage && (
          <Grid container item xs={12} sm={6} justify="flex-start">
            <Button
              startIcon={<NavigateBeforeIcon />}
              fullWidth={isSmall}
              className={css({
                textAlign: "left",
              })}
              color="primary"
              data-cy="doc.previous"
              onClick={() => {
                handleGoToPage(previousPage);
              }}
            >
              {truncate(previousPage?.label ?? "", { length: 50 })}
            </Button>
          </Grid>
        )}

        {nextPage && (
          <Grid container item xs={12} sm={6} justify="flex-end">
            <Button
              endIcon={<NavigateNextIcon />}
              fullWidth={isSmall}
              className={css({
                textAlign: "right",
              })}
              color="primary"
              data-cy="doc.next"
              onClick={() => {
                handleGoToPage(nextPage);
              }}
            >
              {truncate(nextPage?.label ?? "", { length: 50 })}
            </Button>
          </Grid>
        )}
      </Grid>
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

  function renderSideBarContent(elements: IDocSidebar) {
    const isArray = Array.isArray(elements);

    return (
      <ul>
        {Object.entries(props.sideBar).map((element, i) => {
          return <React.Fragment key={i} />;
        })}
      </ul>
    );
  }

  function renderSideBar() {
    const list = <div />;
    // <List>
    {
      /* {Object.keys(props.sideBar)?.map((element, i) => {
          const isSelected = false;

          return (
            <React.Fragment key={i}>
              <MenuItem
                button
                dense
                selected={isSelected}
                className={css({
                  fontWeight: isSelected ? 700 : "inherit",
                  color: isSelected ? theme.palette.primary.main : "inherit",
                })}
                component={Link}
                to={`${props.url}/${h1.id}`}
                data-cy={`doc.table-of-content.h1`}
                data-cy-page-id={h1.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
              >
                {renderMenuElement(h1, isSelected)}
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
              ></Collapse>
            </React.Fragment>
          );
        })}
      </List> */
    }
    {
      /* ); */
    }

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
                // background: lightBackground,
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
                // background: lightBackground,
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

  function renderMenuElement(index: IMarkdownIndex, selected: boolean) {
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
            <Typography
              noWrap
              className={css({
                fontWeight: selected
                  ? theme.typography.fontWeightBold
                  : "inherit",
                width: "100%",
                display: "inline-block",
              })}
              dangerouslySetInnerHTML={{
                __html: index.label,
              }}
            />
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
