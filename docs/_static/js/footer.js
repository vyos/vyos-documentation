$(document).ready(function() {
  insertIframe()

  const options = {
    threshold: 0.01,
  }
  const divDoc = document.querySelector('.iframe-container')
  const innerSidebar = $('.wy-side-scroll')

  intersectionObserver(options, divDoc, innerSidebar)

  $(window).resize(function() {
    intersectionObserver(options, divDoc, innerSidebar)
  })

  $(window).scroll(function() {
    intersectionObserver(options, divDoc, innerSidebar)
  })
});

function intersectionObserver(options, divDoc, innerSidebar) {
  // we delete any inline-styles from innerSidebar
  if($(innerSidebar).attr('style')) {
    innerSidebar.removeAttr('style')
  }
  const screenWidth = $(window).width()
  const sidebar = $('.wy-nav-side')
  const documentHeight = $(document).height()
  const iframeHeight = $('.iframe-container').height()
  const currentPosition = $(document).scrollTop()
  const additionalPaddingFromSidebar = screenWidth > 991 ? 70 : 83
  const heightThatIsAddedByPaddings = 36
  const resultOfSums = documentHeight - 
    iframeHeight - 
    currentPosition - 
    additionalPaddingFromSidebar - 
    heightThatIsAddedByPaddings
  const heightOfAdditionalButton = 50

  const onEntry = (entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        if(resultOfSums <= 70) {
          $(sidebar).hide()
          return 
        }
        $(sidebar).show()
        $(sidebar).height(resultOfSums)
        $(sidebar).css('margin-bottom', '20px')
        $(innerSidebar).removeAttr('style')
        $(innerSidebar).height(resultOfSums - heightOfAdditionalButton)
        return
      } else {
        $(sidebar).removeAttr('style')
        $(innerSidebar).removeAttr('style')
      }
    })
  }
  const observer = new IntersectionObserver(onEntry, options);
  observer.observe(divDoc)

  if($(innerSidebar).attr('style')) {
    observer.unobserve(divDoc)
  }

  determineHeightOfFooterContainer()

}

function determineHeightOfFooterContainer() {
  const iframeFooter= $('#vyos-footer-iframe');
  const title = window.document.getElementsByTagName('title')?.[0]?.text;
  const iframeContainer = $('.iframe-container')
  const href = window.location.href;

  window.addEventListener('message',function(message){
    if(message.data.footerIframeHeight){
      $(iframeFooter).css('min-height', `${message.data.footerIframeHeight + 1}px`)
      $(iframeContainer).height(message.data.footerIframeHeight + 1)
      iframeFooter[0].contentWindow.postMessage({title, href},'*');
    }
  })
}

function insertIframe() {
  const body = $('.wy-body-for-nav')
  body.append(divWithIframe)
}

const divWithIframe = `<div class="iframe-container">
  <iframe src='https://vyos.io/iframes/footer' id='vyos-footer-iframe'></iframe>
</div>`
