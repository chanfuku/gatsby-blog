import useMediaQuery from '@mui/material/useMediaQuery'

export default function IsMobileSize() {
  return !useMediaQuery('(min-width:768px)')
}
