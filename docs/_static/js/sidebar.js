$(document).ready(function () {
  removeOverlayAndCloseSidebar()
  documentLoaded()

  $(window).on("resize", function () {
    const screenWidth = window.innerWidth

    if (screenWidth <= 991) return userIsInTabletScreenWidth(screenWidth)
    return removeOverlayAndButtons(screenWidth)
  })

})

function removeButtons() {
  const alreadyCreatedOpenButtonCheck = $('.openLeftSidebarMenuButton')
  const alreadyCreatedCloseButtonCheck = $('.closeButtonDivLine')

  if(alreadyCreatedOpenButtonCheck[0]) alreadyCreatedOpenButtonCheck[0].remove()
  if(alreadyCreatedCloseButtonCheck[0]) alreadyCreatedCloseButtonCheck[0].remove()
}

function documentLoaded() {
  const screenWidth = window.innerWidth

  if (screenWidth <= 991) return userIsInTabletScreenWidth(screenWidth)
  return
}

function userIsInTabletScreenWidth(screenWidth) {
  const alreadyCreatedButtonCheck = $('.openLeftSidebarMenuButton')
  if (alreadyCreatedButtonCheck[0]) return
  createOpenSidebarButton(screenWidth)
  createCloseSidebarButton(screenWidth)
  removeOverlayAndCloseSidebar()
}

function createOverlay(screenWidth) {
  const contentContainer = $('.wy-nav-content')
  contentContainer.addClass('overlay')

  const overlayDiv = `
    <div class='overlayDiv' />
  `

  contentContainer.append(overlayDiv)

  $('.wy-nav-content.overlay').on('click', onOverlayClickHandler)
}

function onOverlayClickHandler() {
  removeOverlayAndCloseSidebar()
}

function removeOverlayAndCloseSidebar() {
  const screenWidth = window.innerWidth

  const contentContainer = $('.wy-nav-content')
  contentContainer.removeClass('overlay')

  const overlayDiv = $('.overlayDiv')
  overlayDiv.remove()

  const leftSidebarOpened = $('nav.wy-nav-side.shift')
  leftSidebarOpened.removeClass('shift')

  const leftSidebar = $('nav.wy-nav-side')

  // that's working don't touch
  if(screenWidth > 991) {
    // when user is not in tablet -> we add classes on opened sidebar and remove classes on closed sidebar
    const contentSection = $('section.wy-nav-content-wrap')
    const contentDiv = $('div.wy-nav-content')
    contentSection.addClass('wy-nav-content-wrap-opened-sidebar')
    contentDiv.addClass('wy-nav-content-opened-sidebar')
    contentSection.removeClass('wy-nav-content-wrap-closed-sidebar')
    contentDiv.removeClass('wy-nav-content-closed-sidebar')
    leftSidebar.removeClass('display_none')
    return 
  }

  if(screenWidth <= 991) {
    // I add closed classes to make contentContainer 100% width
    const contentSection = $('section.wy-nav-content-wrap')
    const contentDiv = $('div.wy-nav-content')
    contentSection.removeClass('wy-nav-content-wrap-opened-sidebar')
    contentDiv.removeClass('wy-nav-content-opened-sidebar')
    contentSection.addClass('wy-nav-content-wrap-closed-sidebar')
    contentDiv.addClass('wy-nav-content-closed-sidebar')
    leftSidebar.addClass('display_none')
  }
  
}

function createOpenSidebarButton() {
  const divToInsert = $('div[role=navigation][aria-label="Page navigation"]')
  divToInsert[0].insertAdjacentHTML('afterbegin', formOpenSidebarButton())
 
  const newlyCreatedButton = $('.openLeftSidebarMenuButton')

  newlyCreatedButton.on('click', onOpenLeftSidebarMenuButtonClickHandler)
}

function onOpenLeftSidebarMenuButtonClickHandler(e) {
  e.stopPropagation()
  const leftSidebar = $('nav.wy-nav-side')
  const leftSidebarOpened = $('nav.wy-nav-side.shift')
  if(leftSidebarOpened[0]) {
    // leftSidebarOpened.removeClass('shift')
    removeOverlayAndCloseSidebar()
  }

  createOverlay()
  if(leftSidebar.hasClass('display_none')) leftSidebar.removeClass('display_none')
  if(leftSidebar.hasClass('.additionalStylesForShift')) leftSidebar.removeClass('.additionalStylesForShift')
  // here I add classes to contentSection and contentDiv to make them margined left and remove closed classes if any
  const contentSection = $('section.wy-nav-content-wrap')
  const contentDiv = $('div.wy-nav-content')
  // contentSection.removeClass('wy-nav-content-wrap-closed-sidebar')
  // contentDiv.removeClass('wy-nav-content-closed-sidebar')
  // contentSection.addClass('wy-nav-content-wrap-opened-sidebar')
  // contentDiv.addClass('wy-nav-content-opened-sidebar')
  return leftSidebar.addClass('shift')
}

function createCloseSidebarButton(screenWidth) {
  const updatedLeftSidebarScrollDiv = $('nav.wy-nav-side')

  const alreadyCreatedButtonCheck = $('div.closeLeftSidebarMenuButton')
  if(alreadyCreatedButtonCheck[0]) return 

  updatedLeftSidebarScrollDiv[0].insertAdjacentHTML('beforeend', formCloseLeftSidebarButton())
  updatedLeftSidebarScrollDiv.addClass('additionalStylesForShift')

  const createdCloseSidebarButton = $('.closeButtonDivLine')

  createdCloseSidebarButton.on('click', function () {
    removeOverlayAndCloseSidebar()
  })
}

function formOpenSidebarButton() {
  return `
    <div class='openLeftSidebarMenuButton'>
      ${hamburgerIcon}
    </div>
  `
}

function formCloseLeftSidebarButton() {
  return `
    <div class='closeButtonDivLine'>
      <div class='closeLeftSidebarMenuButton'>
        Close
      </div>
    </div>
  `
}

function removeOverlayAndButtons(screenWidth) {
  removeOverlayAndCloseSidebar()
  removeButtons()
}
