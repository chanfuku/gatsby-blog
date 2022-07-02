import * as React from "react"
import { navigate } from "gatsby"
import { makeStyles } from "@material-ui/core/styles"
import { Pagination as MuPagination } from "@material-ui/lab"

const useStyles = makeStyles({
  root: {
    display: `flex`,
    flexWrap: `wrap`,
    justifyContent: `center`,
    alignItems: "center",
  },
});

const Pagination = ({ totalCount, currentPage = 1 }) => {
  const classes = useStyles()
  const PER_PAGE = 8
  const numberOfPages = Math.ceil(totalCount / PER_PAGE)
  const defaultPage = 1

  const handleChange = (_event, value) => {
    value === 1 ? navigate(`/`) : navigate(`/page/${value}`)
  }
  return (
    <div className={classes.root}>
      <MuPagination
        variant="outlined"
        defaultPage={defaultPage}
        count={numberOfPages}
        onChange={handleChange}
        page={Number(currentPage)}
        color="primary"
      />
    </div>
  )
}

export default Pagination
